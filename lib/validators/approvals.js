const { Validator } = require('./validator')
const Owner = require('./options_processor/owners')
const Assignees = require('./options_processor/assignees')
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

  async validate (context, validationSettings) {
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

    if (requiredReviewer.length > 0) {
      validationSettings = Object.assign({}, validationSettings, {required: { owners: ownerList, assignees: assigneeList, reviewers: requiredReviewer }})
    }

    let approvedReviewers = findApprovedReviewers(reviews)

    // if pr creator exists in the list of required reviewers, remove it
    if (requiredReviewer.includes(prCreator)) {
      const foundIndex = requiredReviewer.indexOf(prCreator)
      requiredReviewer.splice(foundIndex, 1)
    }

    return this.processOptions(validationSettings, approvedReviewers)
  }
}

const findApprovedReviewers = (reviews) => {
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
    .filter(element => element.state.toLowerCase() === 'approved')
    .map(review => review.user && review.user.login)
}

module.exports = Approvals
