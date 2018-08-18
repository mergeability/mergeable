const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')

const COUNT_NOT_FOUND_ERROR = `Failed to run the test because 'count' is not provided for 'max' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected Array as input`

class Max {
  static process (validatorContext, input, rule) {
    const filter = rule.max

    let count = filter['count'] ? filter['count'] : filter
    let description = filter['message']
    if (typeof count !== 'number') {
      return constructError(validatorContext, input, filter, COUNT_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext} does have a minimum of '${count}'`
    if (!description) description = `${validatorContext} count is more than "${count}"`

    if (Array.isArray(input)) {
      isMergeable = !(input.length > count)
    } else {
      return constructError(validatorContext, input, filter, UNKNOWN_INPUT_TYPE_ERROR)
    }

    return contructOutput(validatorContext, input, rule, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    })
  }
}

module.exports = Max
