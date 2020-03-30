const { Action } = require('./action')
const _ = require('lodash')

const createRequestReview = async (context, number, reviewers) => {
  return context.github.pulls.createReviewRequest(
    context.repo({ pull_number: number, reviewers })
  )
}

const fetchCollaborators = async (context) => {
  return context.github.repos.listCollaborators(
    context.repo()
  )
}

class RequestReview extends Action {
  constructor () {
    super('request_review')
    this.supportedEvents = [
      'pull_request.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    this.logAfterValidateUsage(settings)
    const payload = this.getPayload(context)

    let requestedReviewer = payload.requested_reviewers.map(reviewer => reviewer.login)
    let reviewers = settings.reviewers
    let reviewerToRequest = _.difference(reviewers, requestedReviewer)
    let prNumber = payload.number

    // get Collaborators
    let rawCollaboratorsResult = await fetchCollaborators(context)
    let collaborators = rawCollaboratorsResult.data.map(user => user.login)

    // remove anyone in the array that is not a collaborator
    let collaboratorsToRequest = _.intersection(reviewerToRequest, collaborators)

    if (collaboratorsToRequest.length === 0) {
      return
    }
    return createRequestReview(
      context,
      prNumber,
      reviewerToRequest
    )
  }
}

module.exports = RequestReview
