const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')
const orProcessor = require('./or')
const validationProcessor = require('../validationProcessor')

const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array type as input`

const andProcessor = (validatorContext, input, rule) => {
  const filters = rule.and

  if (Array.isArray(filters)) {
    return constructError(validatorContext, input, filters, UNKNOWN_INPUT_TYPE_ERROR)
  }

  const validated = filters.map(filter => {
    if (filter.and) {
      return andProcessor(validatorContext, input, filter)
    }
    if (filter.or) {
      return orProcessor(validatorContext, input, filter)
    }

    return validationProcessor(validatorContext, input, filter)
  })

  let isMergeable
  let DEFAULT_SUCCESS_MESSAGE = `All the requisite validations passed for 'and' option`
  let descriptions = ''

  validated.forEach(result => {
    if (isMergeable !== undefined) {
      isMergeable = isMergeable && result.mergeable
    } else {
      isMergeable = result.mergeable
    }

    if (!result.mergeable) {
      if (descriptions.length > 2) {
        descriptions += ` ${` ***AND*** `} ${result.description}`
      } else {
        descriptions += `${result.description}`
      }
    }
  })

  return contructOutput(validatorContext, input, filters, {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : descriptions
  })
}

module.exports = andProcessor
