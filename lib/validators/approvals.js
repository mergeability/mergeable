const { Validator } = require('./validator')
const Owner = require('./options_processor/owners')
const Assignees = require('./options_processor/assignees')
const RequestedReviewers = require('./options_processor/requestedReviewers')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')
const TeamNotFoundError = require('../errors/teamNotFoundError')
const options = require('./options_processor/options')
const _ = require('lodash')

class Approvals extends Validator {
  constructor () {
    super('approvals')
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.synchronize'
    ]
  }

  processOptions (vSettings, value, supportedOptions) {
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

    let reviews = await context.github.paginate(
      context.github.pulls.listReviews.endpoint.merge(
        context.repo({ pull_number: this.getPayload(context).number })
      ),
      res => res.data
    )

    let { requiredReviewers, ownerList, assigneeList, requestedReviewerList } = await this.getRequiredReviewerList(context, validationSettings)

    if (requiredReviewers.length > 0) {
      validationSettings = Object.assign({}, validationSettings, {required: { owners: ownerList, assignees: assigneeList, reviewers: requiredReviewers, requested_reviewers: requestedReviewerList }})
    }

    let approvedReviewers = findReviewersByState(reviews, 'approved')

    // if limit is provided, we only filter the approved Reviewers to members of the teams provided
    if (limitOption && limitOption.teams) {
      let teamMembers = []
      for (let team of limitOption.teams) {
        let members = []
        try {
          members = await getTeamMembers(context, team)
        } catch (err) {
          if (err instanceof TeamNotFoundError) {
            const validatorContext = {name: 'approvals'}
            const output = [constructErrorOutput(validatorContext, team, limitOption, `${err.name}`, err)]
            return consolidateResult(output, validatorContext)
          }
          throw err
        }

        teamMembers = teamMembers.concat(members)
      }
      teamMembers = _.uniq(teamMembers)

      approvedReviewers = _.intersection(approvedReviewers, teamMembers)
    }

    let output = await this.processOptions(validationSettings, approvedReviewers)

    if (blockOption && blockOption.changes_requested) {
      output.push(processBlockOption(blockOption, reviews))
    }

    return consolidateResult(output, { name: 'approvals' })
  }

  async getRequiredReviewerList (context, validationSettings) {
    let prCreator = this.getPayload(context).user.login
    let requiredReviewers = []

    if (validationSettings.required &&
      validationSettings.required.reviewers) {
      requiredReviewers = validationSettings.required.reviewers
    }

    const ownerList = (validationSettings && validationSettings.required && validationSettings.required.owners)
      ? await Owner.process(this.getPayload(context), context) : []

    if (ownerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewers = requiredReviewers.concat(ownerList)

      // there could be duplicates between reviewer and ownerlist
      requiredReviewers = _.uniq(requiredReviewers)
    }

    const assigneeList = (validationSettings && validationSettings.required && validationSettings.required.assignees)
      ? await Assignees.process(this.getPayload(context), context) : []

    if (assigneeList.length > 0) {
      // append it to the required reviewer list
      requiredReviewers = requiredReviewers.concat(assigneeList)

      // there could be duplicates between reviewer and assigneeList
      requiredReviewers = _.uniq(requiredReviewers)
    }

    const requestedReviewerList = (validationSettings && validationSettings.required && validationSettings.required.requested_reviewers)
      ? await RequestedReviewers.process(this.getPayload(context), context) : []

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

  let validatorContext = { name: 'approvals' }
  let result = {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
  }

  return constructOutput(validatorContext, changesRequestedReviewers, blockOption, result)
}

const getTeamMembers = async (context, team) => {
  const stringArray = team.split('/')
  if (stringArray.length !== 2) {
    throw Error(`each team id needs to be given in 'org/team_slug'`)
  }

  const org = stringArray[0]
  const teamSlug = stringArray[1]

  let res
  try {
    res = await context.github.teams.listMembersInOrg({
      org,
      team_slug: teamSlug
    })
  } catch (err) {
    if (err.status === 404) {
      throw new TeamNotFoundError(team)
    }
    throw err
  }

  return res.data.map(member => member.login)
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
