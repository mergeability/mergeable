const { Action } = require('./action')
const _ = require('lodash')

const createRequestReview = async (context, number, reviewers) => {
  return context.github.pullRequests.createReviewRequest(
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

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
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
