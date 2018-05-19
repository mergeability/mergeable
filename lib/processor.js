/**
 *
 * @param input the string run regex against
 * @param filters string | object , if string we check if that regex is excluded from input
 * @returns object { mergeable: bool, description: string | [string]}
 */
const processFilters = (validatorContext, input, filters) => {
  // for backward compatibility, check if the filters is a string
  if (typeof filters === 'string') {
    return mustExclude(validatorContext, input, filters)
  }

  let output = []
  for (let key in filters) {
    switch (key) {
      case 'must_include':
        output.push(mustInclude(validatorContext, input, filters[key]))
        break
      case 'must_exclude':
        output.push(mustExclude(validatorContext, input, filters[key]))
        break
      case 'min':
        output.push(min(validatorContext, input, filters[key]))
        break
      case 'max':
        output.push(max(validatorContext, input, filters[key]))
        break
      case 'begins_with':
        output.push(beginsWith(validatorContext, input, filters[key]))
        break
      case 'ends_with':
        output.push(endsWith(validatorContext, input, filters[key]))
        break
      case 'no_empty':
        output.push(noEmpty(validatorContext, input, filters[key]))
        break
      case 'required':
        output.push(required(validatorContext, input, filters[key]))
        break
      default:
        break
    }
  }

  return mergeResults(output)
}

const mergeResults = (result) => {
  let mergeable = true
  let errorMessages = []

  result.forEach(res => {
    if (!res.mergeable) {
      mergeable = false
    }

    if (res.description) {
      errorMessages.push(res.description)
    }
  })

  return {mergeable, description: errorMessages.length === 0 ? null : errorMessages}
}

const extractFilterParameter = (params) => {
  if (typeof params === 'string') return { regex: params }

  const output = {}
  for (let key in params) {
    switch (key) {
      case 'regex':
        output.regex = params.regex
        break
      case 'match':
        output.match = params.match
        break
      case 'message':
        output.description = params.message
        break
      case 'min':
        output.min = params.min
        break
      case 'max':
        output.max = params.max
        break
      case 'enabled':
        output.enabled = params.enabled
        break
      case 'reviewers':
        output.reviewers = params.reviewers
        break
      default:
        break
    }
  }
  return output
}

const mustInclude = (validatorContext, input, filters) => {
  let {regex, description} = extractFilterParameter(filters)
  let isMergeable

  if (!description) description = `${validatorContext} does not contain "${regex}"`
  let regexObj = new RegExp(regex, 'i')

  if (typeof input === 'string') {
    isMergeable = regexObj.test(input)
  } else { // input must be array
    isMergeable = input.some(label => regexObj.test(label))
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const mustExclude = (validatorContext, input, filters) => {
  let {regex, description} = extractFilterParameter(filters)
  let isMergeable

  if (!description) description = `${validatorContext} contains "${regex}"`

  let regexObj = new RegExp(regex, 'i')
  if (typeof input === 'string') {
    isMergeable = !regexObj.test(input)
  } else { // input must be array
    isMergeable = !input.some(label => regexObj.test(label))
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}
const min = (validatorContext, input, filters) => {
  let min, description
  if (typeof filters === 'number') {
    min = filters
  } else {
    let res = extractFilterParameter(filters)
    min = res.min
    description = res.description
  }

  if (!description) description = `${validatorContext} count is less than "${min}"`
  const isMergeable = !(input.length < min)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const max = (validatorContext, input, filters) => {
  let {max, description} = extractFilterParameter(filters)
  if (!description) description = `${validatorContext} count is more than "${max}"`
  const isMergeable = input.length > max

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const beginsWith = (validatorContext, input, filters) => {
  let {match, description} = extractFilterParameter(filters)
  if (!description) description = `${validatorContext} must begins with "${match}"`
  const isMergeable = input.indexOf(match) === 0

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const endsWith = (validatorContext, input, filters) => {
  let {match, description} = extractFilterParameter(filters)
  if (!description) description = `${validatorContext} must ends with "${match}"`
  const isMergeable = input.indexOf(match) === (input.length - match.length)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const noEmpty = (validatorContext, input, filters) => {
  let {enabled, description} = extractFilterParameter(filters)
  if (!description) description = `The ${validatorContext} can't be empty`
  const isMergeable = !(enabled && input.trim().length === 0)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const required = (validatorContext, input, filters) => {
  let {reviewers, description} = extractFilterParameter(filters)

  // go thru the required list and check against inputs
  let remainingRequired = reviewers

  input.forEach(user => {
    const foundIndex = remainingRequired.indexOf(user)

    if (foundIndex !== -1) {
      remainingRequired.splice(foundIndex, 1)
    }
  })

  if (!description) description = `${validatorContext}: ${remainingRequired} required`
  const isMergeable = remainingRequired.length === 0

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

module.exports = {
  processFilters
}
