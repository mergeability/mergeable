/**
 * Determines if the the PR is mergeable based on regex expression set for
 * label.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (context, settings) => {
  let prNumber = context.payload.pull_request.number
  let labels = await context.github.issues.getIssueLabels(
    context.repo({ number: prNumber })
  )

  let regex = new RegExp(settings.mergeable.label, 'i')
  let isMergeable = !labels.data
    .map(label => label.name)
    .some(label => regex.test(label))

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Label contains "${settings.mergeable.label}"`
  }
}
