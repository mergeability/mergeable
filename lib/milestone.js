// @deprecated
const issues = require('../lib/issues')
/**
 * Determines if the the PR is mergeable based on the name of the milestone set
 * in configuration. Mergeable only if the milestone specified in
 * the configuration is associated to the PR.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let isMergeable = true

  if (settings.milestone) {
    let regex = new RegExp(settings.milestone, 'i')

    isMergeable = pr.milestone != null && regex.test(pr.milestone.title)
  }

  // check PR body to see if closes an issue
  if (!isMergeable) {
    const res = issues.checkIfClosesAnIssue(pr.body)

    if (res.length > 0) {
      isMergeable = await issues.checkIfIssueHaveProperty(context, res, 'milestone', settings.milestone)
    }
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Milestone must be "${settings.milestone}"`
  }
}
