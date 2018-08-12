const contructOutput = require('./lib/constructOutput')
const constructError = require('./lib/constructErrorOutput')

const MATCH_NOT_FOUND_ERROR = `Failed to run the test because 'match' is not provided for 'ends_with' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected string as input`

module.exports = (validatorContext, input, rule) => {
  const filter = rule.begins_with

  const match = filter['match']
  let description = filter['description']
  if (!match) {
    return constructError(validatorContext, input, filter, MATCH_NOT_FOUND_ERROR)
  }

  let isMergeable

  const DEFAULT_SUCCESS_MESSAGE = `${validatorContext} does begins with '${match}'`
  if (!description) description = `${validatorContext} must begins with "${match}"`

  if (typeof input === 'string') {
    isMergeable = input.indexOf(match) === 0
  } else {
    return constructError(validatorContext, input, filter, UNKNOWN_INPUT_TYPE_ERROR)
  }

  return contructOutput(validatorContext, input, rule, {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
  })
}
