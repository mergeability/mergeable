/**
 * checks if the description is empty
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let body = pr.body
  let bodySettings = settings.mergeable.body
  let isMergeable = true

  if (bodySettings === 'non-empty') {
    isMergeable = body.length > 0
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Description on the pull request should not be empty`
  }
}
