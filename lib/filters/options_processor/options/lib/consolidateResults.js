const consolidateResults = require('../../../../validators/options_processor/options/lib/consolidateResults')

module.exports = (result, filter) => {
  let results = consolidateResults(result, filter)
  delete Object.assign(results, { filters: results['validations'] })['validations'];
  return results
}
