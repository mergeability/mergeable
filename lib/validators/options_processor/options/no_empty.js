const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')

const ENABLED_NOT_FOUND_ERROR = `Failed to run the test because 'enabled' is not provided for 'ends_with' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected string as input`

class NoEmpty {
  static process (validatorContext, input, rule) {
    const filter = rule.no_empty

    const enabled = filter['enabled']
    let description = filter['message']
    if (!enabled) {
      return constructError(validatorContext, input, filter, ENABLED_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `The ${validatorContext} is not empty`
    if (!description) description = `The ${validatorContext} can't be empty`

    if (typeof input === 'string') {
      isMergeable = !(enabled && input.trim().length === 0)
    } else if (Array.isArray(input)) {
      isMergeable = input.length !== 0
    } else {
      return constructError(validatorContext, input, filter, UNKNOWN_INPUT_TYPE_ERROR)
    }

    return contructOutput(validatorContext, input, rule, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    })
  }
}

module.exports = NoEmpty
