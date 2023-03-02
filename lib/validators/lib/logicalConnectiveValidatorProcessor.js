const Register = require('../../register')
const getValidatorPromises = require('../../flex/lib/getValidatorPromises')
const consolidateResult = require('../options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('../options_processor/options/lib/constructErrorOutput')

const OPTION_MISSING_ERROR_MESSAGE = 'Failed to validate because the \'validate\' option is missing or empty. Please check the documentation.'

const logicalConnectiveValidatorProcessor = async (context, settings, registry, validatorName) => {
  const validatorContext = { name: validatorName }

  if (!Array.isArray(settings) || settings.length === 0 || settings.validate) {
    return consolidateResult(
      [
        constructErrorOutput(
          validatorName,
          '',
          settings,
          OPTION_MISSING_ERROR_MESSAGE
        )
      ],
      validatorContext
    )
  }

  const rules = { validate: settings }

  try {
    Register.registerValidators(rules, registry)
  } catch (err) {
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

  const output = await Promise.all(promises)

  const validations = []
  let status = 'fail'

  if (validatorName === 'And') {
    status = 'pass'
  }

  let count = 0
  for (const result of output) {
    if (result.status === 'error') {
      status = 'error'
    }

    if (validatorName === 'Or' && result.status === 'pass' && status !== 'error') {
      status = 'pass'
    }

    if (validatorName === 'And' && result.status === 'fail' && status !== 'error') {
      status = 'fail'
    }

    for (const validation of result.validations) {
      validation.description = `Option ${count + 1}: ${result.name}: ${validation.description}`
    }

    validations.push(...result.validations)
    count++
  }

  if (validatorName === 'Not') {
    if (output.length !== 1) {
      return consolidateResult(
        [
          constructErrorOutput(
            validatorName,
            '',
            settings,
            `Failed to validate because the 'validate' option does not have exactly one element, but ${output.length}`
          )
        ],
        validatorContext
      )
    }

    const mapping = {
      error: 'error',
      pass: 'fail',
      fail: 'pass'
    }
    status = mapping[output[0].status]
  }

  return {
    status,
    name: validatorName,
    validations
  }
}

module.exports = logicalConnectiveValidatorProcessor
