const processor = require('../lib/processor')

/**
 * Determines if the the PR is mergeable based on number of assignees
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let assignees = pr.assignees
  let assigneeSetting = settings.mergeable.assignee

  if (typeof assigneeSetting === 'number') {
    assigneeSetting = {min: assigneeSetting}
  }

  return processor.processFilters('Assignee', assignees, assigneeSetting)
}
