const COUNT_NOT_FOUND_ERROR = `Failed to run the test because 'count' is not provided for 'min' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected Array as input`

class Min {
  static process (validatorContext, input, rule) {
    const filter = rule.min

    let count = filter['count'] ? filter['count'] : filter
    let description = filter['message']
    if (typeof count !== 'number') {
      throw new Error(COUNT_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name} does have a minimum of '${count}'`
    if (!description) description = `${validatorContext.name} count is less than "${count}"`

    if (Array.isArray(input)) {
      isMergeable = !(input.length < count)
    } else {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = Min
