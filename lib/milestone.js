/**
 * Determines if the the PR is mergeable based on the name of the milestone set
 * in configuration. Mergeable only if the milestone specified in
 * the configuration is associated to the PR.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (context, settings) => {
  let pr = context.payload.pull_request
  let isMergeable = true

  if (settings.mergeable.milestone) {
    let regex = new RegExp(settings.mergeable.milestone, 'i')
    isMergeable = pr.milestone != null && regex.test(pr.milestone.title)
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Milestone must be ${settings.mergeable.milestone}"`
  }
}
