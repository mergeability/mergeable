const processor = require('../lib/processor')
/**
 * Determines if the the PR is mergeable based on the number of minimum
 * review approval required
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let approvalSettings = settings.mergeable.approvals
  let reviews = await context.github.pullRequests.getReviews(
    context.repo({ number: pr.number })
  )

  let approvedReviewers = reviews.data
    .filter(element => element.state.toLowerCase() === 'approved')
    .map(review => review.user && review.user.login)

  if (typeof approvalSettings === 'number') {
    approvalSettings = {min: approvalSettings}
  }

  return processor.processFilters('Approval', approvedReviewers, approvalSettings)
}
