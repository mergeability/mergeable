/**
 * checks if the description is empty
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let description = pr.body
  let isMergeable = description.trim().length > 0

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Description on the pull request should not be empty`
  }
}
