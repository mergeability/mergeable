/**
 * Determines if the the PR is mergeable based on the number of minimum
 * review approval required
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let min = settings.mergeable.approvals
  let reviews = await context.github.pullRequests.getReviews(
    context.repo({ number: pr.number })
  )

  let isMergeable = reviews.data
    .filter(element => element.state.toLowerCase() === 'approved')
    .length >= min

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `At least ${min} review approval(s) required.`
  }
}
