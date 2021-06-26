const { Action } = require('./action')
const _ = require('lodash')

class RequestReview extends Action {
  constructor () {
    super('request_review')
    this.supportedEvents = [
      'pull_request.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const payload = this.getPayload(context)

    const requestedReviewer = payload.requested_reviewers.map(reviewer => reviewer.login)

    let reviewers = settings.reviewers

    // remove author since they can not be requested for a review
    reviewers = reviewers.filter(reviewer => reviewer !== payload.user.login)

    const reviewerToRequest = _.difference(reviewers, requestedReviewer)
    const prNumber = payload.number

    // get Collaborators
    const collaborators = await this.githubAPI.listCollaborators(context, context.repo())

    // remove anyone in the array that is not a collaborator
    const collaboratorsToRequest = _.intersection(reviewerToRequest, collaborators)

    if (collaboratorsToRequest.length === 0) {
      return
    }
    return this.githubAPI.requestReviewers(
      context,
      prNumber,
      reviewerToRequest
    )
  }
}

module.exports = RequestReview
