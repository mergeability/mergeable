const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected string as input'
const LIST_NOT_FOUND_ERROR = 'Failed to run the test because \'none_of\' option is not present. Please check README for more information about configuration'

class NoneOf {
  static process (validatorContext, input, rule) {
    const filter = rule.none_of
    if (typeof input !== 'string') {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }
    if (!Array.isArray(filter)) {
      throw new Error(LIST_NOT_FOUND_ERROR)
    }

    const isExcluded = !filter.includes(input.toLowerCase())

    const successMessage = `'${input}' is not in the none_of list'`
    const failureMessage = `'${input}' is in the none_of list'`

    return {
      status: isExcluded ? 'pass' : 'fail',
      description: isExcluded ? successMessage : failureMessage
    }
  }
}

module.exports = NoneOf
