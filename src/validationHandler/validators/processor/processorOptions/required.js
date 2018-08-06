const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')

const REVEIWER_NOT_FOUND_ERROR = `Failed to run the test because 'reviewers' is not provided for 'required' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array of string as input`

module.exports = (validatorContext, input, rule) => {
  const filter = rule.required

  const reviewers = filter['reviewers'] ? filter['reviewers'] : []
  const owners = filter['owners'] ? filter['owners'] : []
  let description = filter['description']
  if (!reviewers && !owners) {
    return constructError(validatorContext, input, filter, REVEIWER_NOT_FOUND_ERROR)
  }

  // go thru the required list and check against inputs
  let remainingRequired = reviewers
  if (!Array.isArray(input)) {
    return constructError(validatorContext, input, filter, UNKNOWN_INPUT_TYPE_ERROR)
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

  return contructOutput(validatorContext, input, filter, {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
  })
}
