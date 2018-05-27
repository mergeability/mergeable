const processor = require('../lib/processor')

/**
 * Determines if the the PR is mergeable based on regex expression set for
 * title.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let title = pr.title
  let titleSettings = settings.title
  if (!titleSettings) return true
  return processor.processFilters('Title', title, settings.title)
}
