const processor = require('../lib/processor')
/**
 * checks if the description is empty
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let description = pr.body
  let descriptionSettings = settings.description

  if (!descriptionSettings) {
    descriptionSettings = {
      no_empty: {
        enabled: true
      }
    }
  }

  return processor.processFilters('Description', description, descriptionSettings)
}
