const parseOwners = require('./parseOwners')

/**
 * Determines if the the PR is mergeable based on regex expression set for
 * title.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  // settings doesn't require to check owners so return true
  if (!(settings.approvals && settings.approvals.required && settings.approvals.required.owners)) {
    return []
  }

  const CODEOWNERS = await retrieveCODEOWNER(context)
  if (!CODEOWNERS) return []

  const owners = parseOwners(CODEOWNERS)

  const compare = await context.github.repos.compareCommits(context.repo({
    base: pr.base.sha,
    head: pr.head.sha
  }))

  const paths = compare.data.files.map(file => file.filename)

  let requiredOwners = []

  paths.forEach(path => {
    const res = owners.for(path)
    if (res.length > 0) {
      requiredOwners = res
    }
  })

  // since requiredOwners could be email addresses make sure
  requiredOwners = await extractUserId(requiredOwners)

  return requiredOwners
}


