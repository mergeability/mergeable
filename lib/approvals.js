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
  let approvalSettings = settings.mergeable.approvals || 0
  let reviews = await context.github.pullRequests.getReviews(
    context.repo({ number: pr.number })
  )

  let prCreator = pr.user.login
  let filteredReviews = filterOutOldReviews(reviews.data)
  let approvedReviewers = filteredReviews
    .filter(element => element.state.toLowerCase() === 'approved')
    .map(review => review.user && review.user.login)

  if (typeof approvalSettings === 'number') {
    approvalSettings = {min: approvalSettings}
  } else {
    // if pr creator exists in the list of required reviewers, remove it
    if (approvalSettings.required &&
      approvalSettings.required.reviewers &&
      approvalSettings.required.reviewers.includes(prCreator)) {
      const foundIndex = approvalSettings.required.reviewers.indexOf(prCreator)
      approvalSettings.required.reviewers.splice(foundIndex, 1)
    }
  }

  return processor.processFilters('Approval', approvedReviewers, approvalSettings)
}

const filterOutOldReviews = (reviews) => {
  const ordered = _.orderBy(reviews, ['submitted_at'], ['desc'])
  const filteredReviews = _.uniqBy(ordered, 'user.login')

  return filteredReviews
}
