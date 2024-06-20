const Teams = require('./teams')
const TeamNotFoundError = require('../../errors/teamNotFoundError')
const EventAware = require('../../eventAware')
const searchAndReplaceSpecialAnnotations = require('../../actions/lib/searchAndReplaceSpecialAnnotation')
const { forEach } = require('p-iteration')

/**
 * ListProcessor replaces annotations in an array of strings.
 * Team slugs are exploded to the members they contain.
 * All elements are lowercased to be used for comparison with the one_of or none_of option processor.
 * @returns a new array containing the replacements
 */
class ListProcessor {
  static async process (list, context) {
    if (!Array.isArray(list)) {
      list = [list]
    }

    const candidates = []
    const helper = new EventAware()
    const payload = helper.getPayload(context)
    const evt = helper.getEventAttributes(context)
    await forEach(list, async (element) => {
      if (element.match(/^@.+\/[^/]+$/)) {
        try {
          const teamMembers = await Teams.extractTeamMembers(context, [element])
          candidates.push(...teamMembers.map((m) => m.toLowerCase()))
        } catch (err) {
          if (err instanceof TeamNotFoundError) {
            // uncritical, is just no candidate
          } else {
            throw err
          }
        }
      } else {
        const replacement = searchAndReplaceSpecialAnnotations(element, payload, evt)
        candidates.push(replacement.toLowerCase())
      }
    })

    return candidates
  }
}

module.exports = ListProcessor
