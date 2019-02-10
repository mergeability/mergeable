const { Action } = require('./action')
const _ = require('lodash')

const createRequestReview = async (context, number, reviewers) => {
  return context.github.pullRequests.createReviewRequest(
    context.repo({ number, reviewers })
  )
}

class Comment extends Action {
  constructor () {
    super()
    this.supportedEvents = [
      'pull_request.opened'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    const payload = this.getPayload(context)

    let requestedReviewer = payload.requested_reviewers.map(reviewer => reviewer.login)
    let reviewers = settings.reviewers
    let reviewerToRequest = _.difference(reviewers, requestedReviewer)

    let prNumber = payload.number

    if (reviewerToRequest.length === 0) {
      return
    }

    return createRequestReview(
      context,
      prNumber,
      reviewerToRequest
    )
  }
}

module.exports = Comment
