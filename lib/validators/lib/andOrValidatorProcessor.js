const register = require('../../register')
const { getValidatorPromises } = require('../../flex')
const consolidateResult = require('../options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('../options_processor/options/lib/constructErrorOutput')

const ERROR_MESSAGE = `Failed to validate because the 'validate' option is missing or empty. Please check the documentation.`

const andOrValidatorProcessor = async (context, settings, registry, validatorName) => {
  const validatorContext = { name: validatorName }

  if (!Array.isArray(settings) || settings.length === 0) {
    return consolidateResult(
      [
        constructErrorOutput(
          validatorName,
          '',
          settings,
          ERROR_MESSAGE
        )
      ],
      validatorContext
    )
  }

  const rules = { validate: settings }

  try {
    register.registerValidators(rules, registry)
  } catch (err) {
    // Should I avoid a console error and consolidateOutput instead?
    return consolidateResult(
      [
        constructErrorOutput(
          validatorName,
          '',
          settings,
          'Unsupported validator ' + err
        )
      ],
      validatorContext
    )
  }

  const promises = getValidatorPromises(context, registry, rules)

  if (promises.length === 0) {
    return consolidateResult(
      [
        constructErrorOutput(
          validatorName,
          '',
          settings,
          ERROR_MESSAGE
        )
      ],
      validatorContext
    )
  }

  const output = await Promise.all(promises)

  const validations = []
  let status = 'fail'

  if (validatorName === 'And') {
    status = 'pass'
  }

  let count = 1
  for (let result of output) {
    if (result.status === 'error') {
      status = 'error'
    }

    if (validatorName === 'Or' && result.status === 'pass' && status !== 'error') {
      status = 'pass'
    }

    if (validatorName === 'And' && result.status === 'fail' && status !== 'error') {
      status = 'fail'
    }

    for (let validation of result.validations) {
      validation.description = `Option ${count}: ${result.name}: ${validation.description}`
    }

    validations.push(...result.validations)
    count++
  }

  return {
    status,
    name: validatorName,
    validations
  }
}

module.exports = andOrValidatorProcessor
