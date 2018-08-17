const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')

const REGEX_NOT_FOUND_ERROR = `Failed to run the test because 'regex' is not provided for 'must_include' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected either string or array of string as input`

class MustInclude {
  static process(validatorContext, input, rule) {
    const filter = rule.must_include

    const regex = filter['regex']
    let description = filter['message']
    if (!regex) {
      return constructError(validatorContext, input, filter, REGEX_NOT_FOUND_ERROR)
    }

    let isMergeable

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext} must include '${regex}'`
    if (!description) description = `${validatorContext} does not include "${regex}"`
    let regexObj

    try {
      regexObj = new RegExp(regex, 'i')
    } catch (err) {
      return constructError(validatorContext, input, filter, `Failed to create a regex expression with the provided regex: ${regex}`)
    }

    if (typeof input === 'string') {
      isMergeable = regexObj.test(input)
    } else if (Array.isArray(input)) {
      isMergeable = input.some(label => regexObj.test(label))
    } else {
      return constructError(validatorContext, input, filter, UNKNOWN_INPUT_TYPE_ERROR)
    }

    return contructOutput(validatorContext, input, rule, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    })
  }
}

module.exports = MustInclude
