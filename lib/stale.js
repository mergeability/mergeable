/**
 * Determines if an issue or PR is stale and create a message if needed.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (context, settings) => {
  const DAY_SETTING = 20 // should read from config.
  const MAX_ISSUES = 20 // max issues to retrieve each time.

  let secs = DAY_SETTING * 24 * 60 * 60 * 1000
  let timestamp = new Date(new Date() - secs)
  timestamp = timestamp.toISOString().replace(/\.\d{3}\w$/, '')

  let searchResults = await context.github.search.issues({
    q: `repo:${context.repo().owner}/${context.repo().repo} is:open updated:<${timestamp}`,
    sort: 'updated',
    order: 'desc',
    per_page: MAX_ISSUES
  })

  let issues = searchResults.data.items
  console.log(issues)
  // TODO create comment for each issue.
}
