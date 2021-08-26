const MATCH_NOT_FOUND_ERROR = 'Failed to run the test because \'match\' is not provided for \'boolean\' option. Please check README for more information about configuration'
const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected strings "true" or "false", or boolean literal `true` or `false` as input'

class BooleanMatch {
  static process (validatorContext, input, rule) {
    const filter = rule.boolean
    const match = filter.match
    let description = filter.message

    if (match == null) {
      throw new Error(MATCH_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `The ${validatorContext.name} is ${match}`
    if (!description) description = `The ${validatorContext.name} must be ${match}`

    if (input === 'true' || input === 'false' || typeof input === 'boolean') {
      isMergeable = input.toString() === match.toString()
    } else {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = BooleanMatch
