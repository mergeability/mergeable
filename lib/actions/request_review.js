const { Action } = require('./action')
const logger = require('../logger')
const _ = require('lodash')

const createRequestReview = async (context, number, reviewers, actionObj) => {
  let res
  try {
    res = await context.octokit.pulls.requestReviewers(
      context.repo({ pull_number: number, reviewers })
    )
  } catch (err) {
    const errorLog = {
      log_type: logger.logTypes.REQUEST_REVIEW_FAIL_ERROR,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      action_name: actionObj.name
    }

    actionObj.log.error(JSON.stringify(errorLog))
  }
  return res
}

const fetchCollaborators = async (context) => {
  return context.octokit.repos.listCollaborators(
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

  async afterValidate (context, settings, name, results) {
    const payload = this.getPayload(context)

    let requestedReviewer = payload.requested_reviewers.map(reviewer => reviewer.login)

    let reviewers = settings.reviewers

    // remove author since they can not be requested for a review
    reviewers = reviewers.filter(reviewer => reviewer !== payload.user.login)

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
      reviewerToRequest,
      this
    )
  }
}

module.exports = RequestReview
