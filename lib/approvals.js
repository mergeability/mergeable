const processor = require('../lib/processor')
const _ = require('lodash')
const owners = require('../lib/owners')
/**
 * Determines if the the PR is mergeable based on the number of minimum
 * review approval required
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let approvalSettings = settings.approvals || 0
  let reviews = await context.github.pullRequests.getReviews(
    context.repo({ number: pr.number })
  )

  let prCreator = pr.user.login
  let requiredReviewer = []

  if (approvalSettings.required &&
    approvalSettings.required.reviewers) {
    requiredReviewer = approvalSettings.required.reviewers
  }

  const ownerList = await owners(pr, context, settings)

  if (ownerList.length > 0) {
    // append it to the required reviewer list
    requiredReviewer = requiredReviewer.concat(ownerList)

    // there could be duplicates between reviewer and ownerlist
    requiredReviewer = _.uniq(requiredReviewer)

    // replace owner and reviewer list in the settings
    approvalSettings = Object.assign({}, approvalSettings, {required: { owners: ownerList, reviewers: requiredReviewer }})
  } else if (settings.approvals && settings.approvals.required && settings.approvals.required.owners) {
    approvalSettings = Object.assign({}, approvalSettings, {required: { reviewers: requiredReviewer }})
  }

  let filteredReviews = filterOutOldReviews(reviews.data)
  let approvedReviewers = filteredReviews
    .filter(element => element.state.toLowerCase() === 'approved')
    .map(review => review.user && review.user.login)

  if (typeof approvalSettings === 'number') {
    approvalSettings = {min: approvalSettings}
  } else {
    // if pr creator exists in the list of required reviewers, remove it
    if (requiredReviewer.includes(prCreator)) {
      const foundIndex = requiredReviewer.indexOf(prCreator)
      requiredReviewer.splice(foundIndex, 1)
    }
  }

  return processor.processFilters('Approval', approvedReviewers, approvalSettings)
}

const filterOutOldReviews = (reviews) => {
  const ordered = _.orderBy(reviews, ['submitted_at'], ['desc'])
  const filteredReviews = _.uniqBy(ordered, 'user.login')

  return filteredReviews
}
