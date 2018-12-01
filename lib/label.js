// @deprecated
const processor = require('../lib/processor')
/**
 * Determines if the the PR is mergeable based on regex expression set for
 * label.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let prNumber = pr.number
  let labels = await context.github.issues.getIssueLabels(
    context.repo({ number: prNumber })
  )

  return processor.processFilters('Label', labels.data.map(label => label.name), settings.label)
}
