const processor = require('../lib/processor')
const _ = require('lodash')
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
  console.log('data', reviews.data)
  let filteredReviews = filterOutOldReviews(reviews.data)
  console.log('oldReview', filteredReviews)
  let approvedReviewers = filteredReviews
    .filter(element => element.state.toLowerCase() === 'approved')
    .map(review => review.user && review.user.login)

  if (typeof approvalSettings === 'number') {
    approvalSettings = {min: approvalSettings}
  }

  return processor.processFilters('Approval', approvedReviewers, approvalSettings)
}

const filterOutOldReviews = (reviews) => {
  const ordered = _.orderBy(reviews, ['submitted_at'], ['desc'])
  console.log('ordered', ordered)
  const filteredReviews = _.uniqBy(ordered, 'user.login')

  return filteredReviews
}
