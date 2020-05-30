const { Validator } = require('./validator')
const andOrValidatorProcessor = require('./lib/andOrValidatorProcessor')

class And extends Validator {
  constructor () {
    super('and')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'validate'
    ]
    this.supportedSettings = {}
  }

  async validate (context, validationSettings, registry) {
    return andOrValidatorProcessor(context, validationSettings.validate, registry, 'And')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = And
