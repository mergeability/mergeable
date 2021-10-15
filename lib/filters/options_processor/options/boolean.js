const MATCH_NOT_FOUND_ERROR = 'Failed to run the test because \'match\' is not provided for \'boolean\' option. Please check README for more information about configuration'
const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected strings "true" or "false", or boolean literal `true` or `false` as input'

class BooleanMatch {
  static process (context, filter, input, rule) {
    const match = rule.boolean.match

    if (match == null) {
      throw new Error(MATCH_NOT_FOUND_ERROR)
    }

    if (input !== 'true' && input !== 'false' && typeof input !== 'boolean') {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    let description = rule.boolean.message
    if (!description) description = `The ${filter.name} must be ${match}`

    const DEFAULT_SUCCESS_MESSAGE = `The ${filter.name} is ${match}`

    const isMergeable = input.toString() === match.toString()

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = BooleanMatch
