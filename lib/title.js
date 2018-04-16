/**
 * Determines if the the PR is mergeable based on regex expression set for
 * title.
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (context, settings) => {
  let title = context.payload.pull_request.title
  let regex = new RegExp(settings.mergeable.title, 'i')
  let isMergeable = !regex.test(title)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Title contains "${settings.mergeable.title}"`
  }
}
