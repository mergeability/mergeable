const MATCH_NOT_FOUND_ERROR = `Failed to run the test because 'match' is not provided for 'ends_with' option. Please check README for more information about configuration`
const UNKNOWN_MATCH_TYPE_ERROR = `'match' type invalid, expected string or Array type`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected string or Array as input`

class EndsWith {
  static process (validatorContext, input, rule) {
    const filter = rule.ends_with

    const match = filter['match']
    let description = filter['message']
    if (!match) {
      throw new Error(MATCH_NOT_FOUND_ERROR)
    }

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name} does end with '${match}'`
    if (!description) description = `${validatorContext.name} must end with "${match}"`

    let isMergeable

    try {
      isMergeable = checkIfMergeable(input, match)
    } catch (err) {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

function checkIfMergeable (input, match) {
  if (typeof input !== 'string' && !Array.isArray(input)) {
    throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
  }

  if (typeof match !== 'string' && !Array.isArray(match)) {
    throw new Error(UNKNOWN_MATCH_TYPE_ERROR)
  }

  if (typeof input === 'string') {
    return checkIfInputMatches(match, (item) => input.indexOf(item) === (input.length - item.length))
  } else {
    return input.some(inputItem =>
      checkIfInputMatches(match, (matchItem) => inputItem.indexOf(matchItem) === (inputItem.length - matchItem.length))
    )
  }
}

function checkIfInputMatches (match, func) {
  if (typeof match === 'string') {
    return func(match)
  } else {
    return match.some(item => func(item))
  }
}

module.exports = EndsWith
