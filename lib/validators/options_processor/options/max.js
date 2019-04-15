const COUNT_NOT_FOUND_ERROR = `Failed to run the test because 'count' is not provided for 'max' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected Array or Integer as input`

class Max {
  static process (validatorContext, input, rule) {
    const filter = rule.max

    let count = filter['count'] ? filter['count'] : filter
    let description = filter['message']
    if (typeof count !== 'number') {
      throw new Error(COUNT_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name} does have a maximum of '${count}'`
    if (!description) description = `${validatorContext.name} count is more than "${count}"`

    if (Array.isArray(input)) {
      isMergeable = input.length <= count
    } else if (Number.isInteger(input)) {
      isMergeable = input <= count
    } else {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = Max
