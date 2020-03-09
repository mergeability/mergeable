const { Validator } = require('./validator')
const { getValidatorPromises } = require('../flex')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')

class Or extends Validator {
  constructor () {
    super()
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = ['validate']
  }

  async validate (context, validationSettings) {
    const ERROR_MESSAGE = `Failed to validate because the 'validate' option is missing or empty. Please check the documentation.`
    const VALIDATOR_NAME = 'Or'
    const validatorContext = { name: VALIDATOR_NAME }

    if (!Array.isArray(validationSettings.validate) || validationSettings.validate.length === 0) {
      return consolidateResult(
        [
          constructErrorOutput(
            VALIDATOR_NAME,
            '',
            validationSettings,
            ERROR_MESSAGE
          )
        ],
        validatorContext
      )
    }

    const rule = { validate: validationSettings.validate }

    const registry = { validators: new Map(), actions: new Map() }

    try {
      rule.validate.forEach(validation => {
        let key = validation.do

        if (!registry.validators.has(key)) {
          let Validator = require(`./${key}`)
          registry.validators.set(key, new Validator())
        }
      })
    } catch (err) {
      // Should I avoid a console error and consolidateOutput instead?
      return consolidateResult(
        [
          constructErrorOutput(
            VALIDATOR_NAME,
            '',
            validationSettings,
            'Unsupported validator ' + err
          )
        ],
        validatorContext
      )
    }

    const promises = getValidatorPromises(context, registry, rule)

    if (promises.length === 0) {
      return consolidateResult(
        [
          constructErrorOutput(
            VALIDATOR_NAME,
            '',
            validationSettings,
            ERROR_MESSAGE
          )
        ],
        validatorContext
      )
    }

    const output = await Promise.all(promises)

    const results = {
      status: 'fail',
      name: 'or',
      validations: []
    }

    let count = 1
    for (let result of output) {
      if (result.status === 'pass') {
        return result
      }

      for (let validation of result.validations) {
        validation.description = `Option ${count}: ${result.name}: ${validation.description}`
      }

      results.validations.push(...result.validations)
      count++
    }

    return results
  }
}

module.exports = Or
