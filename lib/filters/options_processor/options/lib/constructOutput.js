const constructOutput = require('../../../../validators/options_processor/options/lib/constructOutput')

module.exports = (filter, input, rule, result, error) => {
  let output = constructOutput(filter, input, rule, result, error)
  delete Object.assign(output, { filter: output['validator'] })['validator']
  return output
}
