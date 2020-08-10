class RequestedReviewers {
  static async process (payload, context) {
    return payload.requested_reviewers.map(user => user.login)
  }
}

module.exports = RequestedReviewers
