class Approvals {
  constructor (minimum) {
    this.minimumApprovals = minimum
  }

  /**
   * @returns {boolean}
   *  true when the number of approvals is the same as or more than the minimum
   *  that was passed into the constructor.
   */
  async isMergeable (context) {
    let reviews = await context.github.pullRequests.getReviews(
      context.repo({ number: context.payload.pull_request.number })
    )

    let approvals = reviews.data.filter(
      element => element.state.toLowerCase() === 'approved'
    )

    return approvals.length >= this.minimumApprovals
  }

  description () {
    return this.minimumApprovals + ' approvals required.'
  }
}

module.exports = Approvals
