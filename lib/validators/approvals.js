const { Validator } = require('./validator')
const Owner = require('./options_processor/owners')
const Assignees = require('./options_processor/assignees')
const RequestedReviewers = require('./options_processor/requestedReviewers')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')
const TeamNotFoundError = require('../errors/teamNotFoundError')
const options = require('./options_processor/options')
const Teams = require('./options_processor/teams')
const _ = require('lodash')

class Approvals extends Validator {
  constructor () {
    super('approvals')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]

    this.supportedSettings = {
      min: {
        count: 'number',
        message: 'string'
      },
      max: {
        count: 'number',
        message: 'string'
      },
      required: {
        reviewers: 'array',
        owners: 'boolean',
        assignees: 'boolean',
        requested_reviewers: 'boolean',
        message: 'string'
      },
      block: {
        changes_requested: 'boolean',
        message: 'string'
      },
      limit: {
        teams: 'array',
        users: 'array',
        owners: 'boolean'
      },
      exclude: {
        users: 'array'
      }
    }
  }

  async processOptions (vSettings, value, supportedOptions) {
    return options.process({
      name: vSettings.do,
      supportedOptions: supportedOptions || this.supportedOptions
    }, value, vSettings, true)
  }

  async validate (context, validationSettings) {
    let blockOption = null
    if (validationSettings.block) {
      blockOption = validationSettings.block
      delete validationSettings.block
    }

    let limitOption = null
    if (validationSettings.limit) {
      limitOption = validationSettings.limit
      delete validationSettings.limit
    }

    let excludeOption = null
    if (validationSettings.exclude) {
      excludeOption = validationSettings.exclude
      delete validationSettings.exclude
    }

    const reviews = await this.githubAPI.listReviews(context, this.getPayload(context).number)

    const {
      requiredReviewers,
      ownerList,
      assigneeList,
      requestedReviewerList
    } = await this.getRequiredReviewerList(context, validationSettings)

    if (requiredReviewers.length > 0) {
      validationSettings = Object.assign({}, validationSettings, {
        required: {
          owners: ownerList,
          assignees: assigneeList,
          reviewers: requiredReviewers,
          requested_reviewers: requestedReviewerList
        }
      })
    }

    let approvedReviewers = findReviewersByState(reviews, 'approved')
    let output = []
    // if limit is provided, we only filter the approved Reviewers to members of the teams provided
    if (limitOption) {
      let owners = []
      let teams = []
      let teamMembers = []

      if (limitOption.teams) teams = teams.concat(limitOption.teams)
      if (limitOption.owners) {
        owners = await Owner.process(this.getPayload(context), context, approvedReviewers)
      }

      teamMembers = await Teams.extractTeamMemberships(context, teams, approvedReviewers)

      teamMembers = _.union(teamMembers, owners)
      const validatorContext = { name: 'approvals' }
      if (limitOption.users) teamMembers = _.union(teamMembers, limitOption.users)

      approvedReviewers = _.intersection(approvedReviewers, teamMembers)
      output.push(constructOutput(validatorContext, approvedReviewers, limitOption, {
        status: 'info',
        description: 'Only approvals from following sources are counted'
      }))
    }

    if (excludeOption) {
      if (excludeOption.users) approvedReviewers = _.without(approvedReviewers, ...excludeOption.users);
    }

    const optionProcessed = await this.processOptions(validationSettings, approvedReviewers)
    output = [...output, ...optionProcessed]

    if (blockOption && blockOption.changes_requested) {
      output.push(processBlockOption(blockOption, reviews))
    }

    return consolidateResult(output, { name: 'approvals' })
  }

  async getRequiredReviewerList (context, validationSettings) {
    const prCreator = this.getPayload(context).user.login
    let requiredReviewers = []

    if (validationSettings.required &&
      validationSettings.required.reviewers) {
      requiredReviewers = validationSettings.required.reviewers
    }

    let ownerList = []
    if (validationSettings && validationSettings.required && validationSettings.required.owners) {
      try {
        ownerList = await Owner.process(this.getPayload(context), context)
      } catch (err) {
        if (err instanceof TeamNotFoundError) {
          const validatorContext = { name: 'approvals' }
          const output = [constructErrorOutput(validatorContext, ownerList, validationSettings, `${err.name}`, err)]
          return consolidateResult(output, validatorContext)
        }
        throw err
      }
    }

    if (ownerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewers = requiredReviewers.concat(ownerList)

      // there could be duplicates between reviewer and ownerlist
      requiredReviewers = _.uniq(requiredReviewers)
    }

    const assigneeList = (validationSettings && validationSettings.required && validationSettings.required.assignees)
      ? await Assignees.process(this.getPayload(context), context)
      : []

    if (assigneeList.length > 0) {
      // append it to the required reviewer list
      requiredReviewers = requiredReviewers.concat(assigneeList)

      // there could be duplicates between reviewer and assigneeList
      requiredReviewers = _.uniq(requiredReviewers)
    }

    const requestedReviewerList = (validationSettings && validationSettings.required && validationSettings.required.requested_reviewers)
      ? await RequestedReviewers.process(this.getPayload(context), context)
      : []

    if (requestedReviewerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewers = requiredReviewers.concat(requestedReviewerList)

      // there could be duplicates between reviewer and assigneeList
      requiredReviewers = _.uniq(requiredReviewers)
    }

    // if pr creator exists in the list of required reviewers, remove it
    if (requiredReviewers.includes(prCreator)) {
      const foundIndex = requiredReviewers.indexOf(prCreator)
      requiredReviewers.splice(foundIndex, 1)
    }

    return { requiredReviewers, ownerList, assigneeList, requestedReviewerList }
  }
}

const processBlockOption = (blockOption, reviews) => {
  const DEFAULT_SUCCESS_MESSAGE = 'No Changes are Requested'

  const description = blockOption.message ? blockOption.message : 'Please resolve all the changes requested'

  const changesRequestedReviewers = findReviewersByState(reviews, 'changes_requested')

  let isMergeable = true

  if (changesRequestedReviewers.length > 0) {
    isMergeable = false
  }

  const validatorContext = { name: 'approvals' }
  const result = {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
  }

  return constructOutput(validatorContext, changesRequestedReviewers, blockOption, result)
}

const findReviewersByState = (reviews, state) => {
  // filter out review submitted comments because it does not nullify an approved state.
  // Other possible states are PENDING and REQUEST_CHANGES. At those states the user has not approved the PR.
  // See https://developer.github.com/v3/pulls/reviews/#list-reviews-on-a-pull-request
  // While submitting a review requires the states be PENDING, REQUEST_CHANGES, COMMENT and APPROVE
  // The payload actually returns the state in past tense: i.e. APPROVED, COMMENTED
  const relevantReviews = reviews.filter(element => element.state.toLowerCase() !== 'commented')

  // order it by date of submission. The docs says the order is chronological but we sort it so that
  // uniqBy will extract the correct last submitted state for the user.
  const ordered = _.orderBy(relevantReviews, ['submitted_at'], ['desc'])
  const uniqueByUser = _.uniqBy(ordered, 'user.login')

  // approved reviewers are ones that are approved and not nullified by other submissions later.
  return uniqueByUser
    .filter(element => element.state.toLowerCase() === state)
    .map(review => review.user && review.user.login)
}

module.exports = Approvals
