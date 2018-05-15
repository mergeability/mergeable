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
      case 'must-include':
        output.push(mustInclude(input, filters[key]))
        break
      case 'must-exclude':
        output.push(mustExclude(input, filters[key]))
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

const mustInclude = (input, match) => {
  const regex = new RegExp(match, 'i')
  const isMergeable = regex.test(input)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Title does not contain "${match}"`
  }
}

const mustExclude = (input, match) => {
  const regex = new RegExp(match, 'i')
  const isMergeable = !regex.test(input)

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Title contains "${match}"`
  }
}

module.exports = processFilters
