const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected string as input'
const LIST_NOT_FOUND_ERROR = 'Failed to run the test because \'one_of\' option is not present. Please check README for more information about configuration'

class OneOf {
  static process (validatorContext, input, rule) {
    const filter = rule.one_of
    if (typeof input !== 'string') {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }
    if (!Array.isArray(filter)) {
      throw new Error(LIST_NOT_FOUND_ERROR)
    }

    const isIncluded = filter.includes(input.toLowerCase())

    const successMessage = `'${input}' is in the one_of list'`
    const failureMessage = `'${input}' is not in the one_of list'`

    return {
      status: isIncluded ? 'pass' : 'fail',
      description: isIncluded ? successMessage : failureMessage
    }
  }
}

module.exports = OneOf
