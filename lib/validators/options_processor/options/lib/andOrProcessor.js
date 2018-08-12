const contructOutput = require('./constructOutput')
const constructError = require('./constructErrorOutput')
const validationProcessor = require('../../optionsProcessor')

const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array type as input`

const andOrProcessor = (validatorContext, input, rule, key) => {
  const filters = rule[key]

  if (!Array.isArray(filters)) {
    return constructError(validatorContext, input, filters, UNKNOWN_INPUT_TYPE_ERROR)
  }

  const validated = filters.map(filter => {
    if (filter.and) {
      return andOrProcessor(validatorContext, input, filter, 'and')
    }
    if (filter.or) {
      return andOrProcessor(validatorContext, input, filter, 'or')
    }

    // we are only passing in one item at a time, so this will only return one element array
    return validationProcessor(validatorContext, input, filter, true)[0]
  })

  let isMergeable
  let DEFAULT_SUCCESS_MESSAGE = `All the requisite validations passed for '${key}' option`
  let descriptions = ''


  validated.forEach(result => {
    const resultSuccess = result.status === 'pass'
    if (isMergeable !== undefined) {
      isMergeable = key === 'and' ? isMergeable && resultSuccess : isMergeable || resultSuccess
    } else {
      isMergeable = resultSuccess
    }

    if (result.status === 'fail') {
      if (descriptions.length > 2) {
        descriptions += ` ${key === 'and' ? ` ***AND*** ` : ` ***OR*** `} ${result.description}`
      } else {
        descriptions += `${result.description}`
      }
    }
  })

  return contructOutput(validatorContext, input, filters, {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : `(${descriptions})`
  })
}

module.exports = andOrProcessor
