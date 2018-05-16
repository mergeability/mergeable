/**
 *
 * @param input the string run regex against
 * @param filters string | object , if string we check if that regex is excluded from input
 * @returns object { mergeable: bool, description: string | [string]}
 */
const processFilters = (input, filters) => {
  // for backward compatibility, check if the filters is a string
  if (typeof filters === 'string') {
    return mustExclude(input, filters)
  }

  let output = []
  for (let key in filters) {
    switch (key) {
      case 'must_include':
        output.push(mustInclude(input, filters[key]))
        break
      case 'must_exclude':
        output.push(mustExclude(input, filters[key]))
        break
      case 'min':
        output.push(min(input, filters[key]))
        break
      case 'max':
        output.push(max(input, filters[key]))
        break
      case 'begins_with':
        output.push(beginsWith(input, filters[key]))
        break
      case 'ends_with':
        output.push(endsWith(input, filters[key]))
        break
      case 'no-empty':
        output.push(noEmpty(input, filters[key]))
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

  return {mergeable, description: errorMessages}
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
      default:
        break
    }
  }
  return output
}

const mustInclude = (input, filters) => {
  let {regex, description} = extractFilterParameter(filters)
  if (!description) description = `Title does not contain "${regex}"`
  const isMergeable = new RegExp(regex, 'i').test(input)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const mustExclude = (input, filters) => {
  let {regex, description} = extractFilterParameter(filters)
  if (!description) description = `Title contains "${regex}"`
  const isMergeable = !(new RegExp(regex, 'i').test(input))

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}
const min = (input, filters) => {
  let {min, description} = extractFilterParameter(filters)
  if (!description) description = `Assignee count is less than "${min}"`
  const isMergeable = input.length < min

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const max = (input, filters) => {
  let {max, description} = extractFilterParameter(filters)
  if (!description) description = `Assignee count is more than "${max}"`
  const isMergeable = input.length > max

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const beginsWith = (input, filters) => {
  let {max, description} = extractFilterParameter(filters)
  if (!description) description = `Assignee count is more than "${max}"`
  const isMergeable = input.length > max

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const endsWith = (input, filters) => {
  let {max, description} = extractFilterParameter(filters)
  if (!description) description = `Assignee count is more than "${max}"`
  const isMergeable = input.length > max

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

const noEmpty = (input, filters) => {
  let {enabled, description} = extractFilterParameter(filters)
  if (!description) description = `The description can't be empty`
  const isMergeable = !(enabled && input.trim().length === 0)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : description
  }
}

module.exports = processFilters
