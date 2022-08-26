const _ = require('lodash')

const ENABLED_NOT_FOUND_ERROR = 'Failed to run the test because \'enabled\' is not provided for \'no_empty\' option. Please check README for more information about configuration'
const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected string or Array as input'

class NoEmpty {
  static process (validatorContext, input, rule) {
    const filter = rule.no_empty

    const enabled = filter.enabled
    let description = filter.message
    if (!enabled && enabled !== false) {
      throw new Error(ENABLED_NOT_FOUND_ERROR)
    }

    if (enabled === false) {
      return {
        status: 'pass',
        description: 'No_empty option is not enabled, as such this validator did not run'
      }
    }

    let isMergeable = false

    const DEFAULT_SUCCESS_MESSAGE = `The ${validatorContext.name} is not empty`
    if (!description) description = `The ${validatorContext.name} can't be empty`

    if (typeof input === 'string') {
      isMergeable = input.trim().length !== 0
    } else if (Array.isArray(input)) {
      isMergeable = input.length !== 0
    } else if (!(input == null || _.isUndefined(input))) {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = NoEmpty
