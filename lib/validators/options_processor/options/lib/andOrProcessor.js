const options = require('../../options')

const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array type as input`

const andOrProcessor = (validatorContext, input, rule, key) => {
  const filters = rule[key]

  if (!Array.isArray(filters)) {
    throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
  }

  const validated = filters.map(filter => {
    if (filter.and) {
      return andOrProcessor(validatorContext, input, filter, 'and')
    }
    if (filter.or) {
      return andOrProcessor(validatorContext, input, filter, 'or')
    }

    // we are only passing in one item at a time, so this will only return one element array
    return options.process(validatorContext, input, filter, true)[0]
  })

  let isMergeable
  let DEFAULT_SUCCESS_MESSAGE = `All the requisite validations passed for '${key}' option`
  let descriptions = ''
  let doesErrorExists = false
  let errorMessage = 'Error occurred: \n'

  validated.forEach(result => {
    if (result.status === 'error') {
      doesErrorExists = true
      errorMessage += `- ${result.description} \n`
    }

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

  let status = 'error'
  let description = errorMessage

  if (!doesErrorExists) {
    status = isMergeable ? 'pass' : 'fail'
    description = isMergeable ? DEFAULT_SUCCESS_MESSAGE : `(${descriptions})`
  }

  return {
    status,
    description
  }
}

module.exports = andOrProcessor
