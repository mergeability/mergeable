/**
 * extract validation stats to be used in populating the output template using handlebars
 *
 * The following Values are extracted
 *
 * validationStatus OverAll status of the valiations
 * validationCount Num of Validations ran
 * passCount Num of validations passed
 * failureCount Num of validations failed
 * errorCount Num of validations errored
 * validations : [{
 *  validatorName: // Validator that was run
 *  status: 'pass|fail|error'
 *  description: 'Defaul or custom Message'
 *  details {
 *    input: // input the tests are run against
 *    setting: rule
 *  }]
 * }
 *
 */
module.exports = (results) => {
  const validationStatuses = results.map(result => result.status)
  const passCount = validationStatuses.filter(status => status === 'pass').length
  const failCount = validationStatuses.filter(status => status === 'fail').length
  const errorCount = validationStatuses.filter(status => status === 'error').length
  let validationStatus = 'pass'

  if (errorCount > 0) {
    validationStatus = 'error'
  } else if (failCount > 0) {
    validationStatus = 'fail'
  }

  const output = {
    validationStatus,
    validationCount: validationStatuses.length,
    passCount,
    failCount,
    errorCount,
    validationSuites: results
  }

  return output
}
