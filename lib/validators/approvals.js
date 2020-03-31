const { Validator } = require('./validator')
const Owner = require('./options_processor/owners')
const Assignees = require('./options_processor/assignees')
const RequestedReviewers = require('./options_processor/requestedReviewers')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')
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
    this.logUsage(validationSettings)

    let blockOption = null
    if (validationSettings.block) {
      blockOption = validationSettings.block
      delete validationSettings.block
    }

    let reviews = await context.github.paginate(
      context.github.pulls.listReviews.endpoint.merge(
        context.repo({ pull_number: this.getPayload(context).number })
      ),
      res => res.data
    )

    let prCreator = this.getPayload(context).user.login
    let requiredReviewer = []

    if (validationSettings.required &&
      validationSettings.required.reviewers) {
      requiredReviewer = validationSettings.required.reviewers
    }

    const ownerList = (validationSettings && validationSettings.required && validationSettings.required.owners)
        ? await Owner.process(this.getPayload(context), context) : []

    const assigneeList = (validationSettings && validationSettings.required && validationSettings.required.assignees)
      ? await Assignees.process(this.getPayload(context), context) : []

    const requestedReviewerList = (validationSettings && validationSettings.required && validationSettings.required.requested_reviewers)
      ? await RequestedReviewers.process(this.getPayload(context), context) : []

    if (ownerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewer = requiredReviewer.concat(ownerList)

      // there could be duplicates between reviewer and ownerlist
      requiredReviewer = _.uniq(requiredReviewer)
    }

    if (assigneeList.length > 0) {
      // append it to the required reviewer list
      requiredReviewer = requiredReviewer.concat(assigneeList)

      // there could be duplicates between reviewer and assigneeList
      requiredReviewer = _.uniq(requiredReviewer)
    }

    if (requestedReviewerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewer = requiredReviewer.concat(requestedReviewerList)

      // there could be duplicates between reviewer and assigneeList
      requiredReviewer = _.uniq(requiredReviewer)
    }

    if (requiredReviewer.length > 0) {
      validationSettings = Object.assign({}, validationSettings, {required: { owners: ownerList, assignees: assigneeList, reviewers: requiredReviewer, requested_reviewers: requestedReviewerList }})
    }

    let approvedReviewers = findReviewersByState(reviews, 'approved')

    // if pr creator exists in the list of required reviewers, remove it
    if (requiredReviewer.includes(prCreator)) {
      const foundIndex = requiredReviewer.indexOf(prCreator)
      requiredReviewer.splice(foundIndex, 1)
    }

    let output = await this.processOptions(validationSettings, approvedReviewers)

    if (blockOption && blockOption.changes_requested) {
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

      output.push(constructOutput(validatorContext, changesRequestedReviewers, blockOption, result))
    }

    return consolidateResult(output, { name: 'approvals' })
  }
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
