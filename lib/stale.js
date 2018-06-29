/**
 * Determines if an issue or PR is stale and create a message if needed.
 * Will only process when the configuration for days considered stale
 * is set for Pulls and Issues respectively.
 *
 * Assumes that the numbers of days are always set if stale property in Settings
 * is defined.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (context, config) => {
  let settings = config.settings.mergeable
  let pullsConf = settings.pull_requests
  let issuesConf = settings.issues

  if (issuesConf && issuesConf.stale && issuesConf.stale.days) {
    search(context, issuesConf)
  }

  if (pullsConf && pullsConf.stale && pullsConf.stale.days) {
    search(context, pullsConf, 'pr')
  }
}

const search = async (context, config, type = 'issue') => {
  const MAX_ISSUES = 20 // max issues to retrieve each time.

  let secs = config.stale.days * 24 * 60 * 60 * 1000
  let timestamp = new Date(new Date() - secs)
  timestamp = timestamp.toISOString().replace(/\.\d{3}\w$/, '')

  let results = await context.github.search.issues({
    q: `repo:${context.repo().owner}/${context.repo().repo} is:open updated:<${timestamp} type:${type}`,
    sort: 'updated',
    order: 'desc',
    per_page: MAX_ISSUES
  })

  results.data.items.forEach(issue => {
    context.github.issues.createComment(
      context.repo({ number: issue.number, body: config.stale.message })
    )
  })
}
