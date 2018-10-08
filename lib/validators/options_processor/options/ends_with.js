const MATCH_NOT_FOUND_ERROR = `Failed to run the test because 'match' is not provided for 'ends_with' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected string or Array as input`

class EndsWith {
  static process (validatorContext, input, rule) {
    const filter = rule.ends_with

    const match = filter['match']
    let description = filter['message']
    if (!match) {
      throw new Error(MATCH_NOT_FOUND_ERROR)
    }

    let isMergeable = input.indexOf(match) === (input.length - match.length)

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name} does ends with '${match}'`
    if (!description) description = `${validatorContext.name} must ends with "${match}"`

    if (typeof input === 'string') {
      isMergeable = input.indexOf(match) === (input.length - match.length)
    } else if (Array.isArray(input)) {
      isMergeable = input.some(item => item.indexOf(match) === (input.length - match.length))
    } else {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = EndsWith
