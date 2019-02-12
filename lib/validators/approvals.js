const { Validator } = require('./validator')
const Owner = require('./options_processor/owners')
const _ = require('lodash')

class Approvals extends Validator {
  constructor () {
    super()
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
    let reviews = await context.github.pullRequests.getReviews(
      context.repo({ number: this.getPayload(context).number })
    )
    let prCreator = this.getPayload(context).user.login
    let requiredReviewer = []

    if (validationSettings.required &&
      validationSettings.required.reviewers) {
      requiredReviewer = validationSettings.required.reviewers
    }

    const ownerList = (validationSettings && validationSettings.required && validationSettings.required.owners)
        ? await Owner.process(this.getPayload(context), context) : []

    if (ownerList.length > 0) {
      // append it to the required reviewer list
      requiredReviewer = requiredReviewer.concat(ownerList)

      // there could be duplicates between reviewer and ownerlist
      requiredReviewer = _.uniq(requiredReviewer)
    }

    if (requiredReviewer.length > 0) {
      validationSettings = Object.assign({}, validationSettings, {required: { owners: ownerList, reviewers: requiredReviewer }})
    }

    let filteredReviews = filterOutOldReviews(reviews.data)
    let approvedReviewers = filteredReviews
      .filter(element => element.state.toLowerCase() === 'approved')
      .map(review => review.user && review.user.login)

    // if pr creator exists in the list of required reviewers, remove it
    if (requiredReviewer.includes(prCreator)) {
      const foundIndex = requiredReviewer.indexOf(prCreator)
      requiredReviewer.splice(foundIndex, 1)
    }

    return this.processOptions(validationSettings, approvedReviewers)
  }
}

const filterOutOldReviews = (reviews) => {
  const ordered = _.orderBy(reviews, ['submitted_at'], ['desc'])
  return _.uniqBy(ordered, 'user.login')
}

module.exports = Approvals
