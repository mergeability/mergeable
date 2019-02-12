const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array of string as input`

class Required {
  static process (validatorContext, input, rule) {
    const filter = rule.required

    const reviewers = filter['reviewers'] ? filter['reviewers'] : []
    const owners = filter['owners'] ? filter['owners'] : []
    let description = filter['message']
    // go thru the required list and check against inputs
    let remainingRequired = reviewers
    if (!Array.isArray(input)) {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }
    input.forEach(user => {
      let foundIndex = remainingRequired.indexOf(user)

      if (foundIndex !== -1) {
        remainingRequired.splice(foundIndex, 1)
      }
    })

    const isMergeable = remainingRequired.length === 0

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name}: all required reviewers have approved`
    if (!description) description = `${validatorContext.name}: ${remainingRequired.map(user => owners.includes(user) ? user + '(Code Owner) ' : user + ' ')}required`

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = Required
