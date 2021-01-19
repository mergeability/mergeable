/**
 * Consolidate Results
 * Take all the result from individual tests and determine whether or not test suite passed
 *
 */
module.exports = (result, validatorContext) => {
  let status = 'pass'
  let tests = []

  let allSkipped = true

  result.forEach(res => {
    if (res.status === 'fail' && status !== 'error') {
      status = 'fail'
    }
    if (res.status === 'error') {
      status = 'error'
    }

    if (res.status !== 'skip') {
      allSkipped = false
    }

    tests.push(res)
  })

  if (allSkipped) {
    status = 'skip'
  }

  return {status: status, name: validatorContext.name, validations: tests}
}
