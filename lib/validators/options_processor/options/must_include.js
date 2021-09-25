const REGEX_NOT_FOUND_ERROR = 'Failed to run the test because \'regex\' is not provided for \'must_include\' option. Please check README for more information about configuration'
const UNKNOWN_INPUT_TYPE_ERROR = 'Input type invalid, expected either string or array of string as input'
const KEY_NOT_FOUND_ERROR = 'Input type is an object and requires providing a \'key\' for the \'must_include\' option.'

class MustInclude {
  static process (validatorContext, input, rule) {
    const filter = rule.must_include

    const regex = filter.regex
    const key = filter.key
    let description = filter.message
    if (!regex) {
      throw new Error(REGEX_NOT_FOUND_ERROR)
    }

    const regexList = [].concat(regex)

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name} ${filter.all ? 'all' : ''}must include '${regexList.join(', ')}'`
    if (!description) description = `${validatorContext.name} ${filter.all ? 'all' : ''}does not include "${regexList.join(', ')}"`

    const isMergeable = regexList.some((regex) => {
      let regexObj

      try {
        let regexFlag = 'i'
        if (filter.regex_flag) {
          regexFlag = filter.regex_flag === 'none' ? '' : filter.regex_flag
        }

        regexObj = new RegExp(regex, regexFlag)
      } catch (err) {
        throw new Error(`Failed to create a regex expression with the provided regex: ${regex}`)
      }

      if (typeof input === 'string') {
        return regexObj.test(input)
      } else if (Array.isArray(input)) {
        const arrayHandler = label => {
          if (typeof label === 'string') {
            return regexObj.test(label)
          } else if (key) {
            return regexObj.test(label[key])
          }
          throw new Error(KEY_NOT_FOUND_ERROR)
        }
        if (filter.all) {
          return input.every(arrayHandler)
        } else {
          return input.some(arrayHandler)
        }
      } else {
        throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
      }
    })

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = MustInclude
