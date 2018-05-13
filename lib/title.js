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
  let titleSettings = settings.mergeable.title

  let excludeRegex = new RegExp(titleSettings, 'i')
  let excludeList = titleSettings
  let includeRegex = titleSettings.include ? new RegExp(titleSettings.include, 'i') : null
  let includeList = titleSettings.include ? titleSettings.include : null
  excludeRegex = titleSettings.exclude ? new RegExp(titleSettings.exclude, 'i') : excludeRegex
  excludeList = titleSettings.exclude ? titleSettings.exclude : excludeList

  let isMergeable = !excludeRegex.test(title) && (includeRegex ? includeRegex.test(title) : true)

  let description = !excludeRegex.test(title) ? null : `Title contains "${excludeList}"`
  description = includeRegex && !includeRegex.test(title) ? `Title does not contain "${includeList}"` : description
  // console.log(description, excludeList, includeList, title);

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}
