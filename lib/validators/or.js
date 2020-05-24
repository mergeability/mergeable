const { Validator } = require('./validator')
const andOrValidatorProcessor = require('./lib/andOrValidatorProcessor')

class Or extends Validator {
  constructor () {
    super('or')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'validate'
    ]
  }

  async validate (context, validationSettings, registry) {
    return andOrValidatorProcessor(context, validationSettings.validate, registry, 'Or')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Or
