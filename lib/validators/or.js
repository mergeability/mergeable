const { Validator } = require('./validator')
const logicalConnectiveValidatorProcessor = require('./lib/logicalConnectiveValidatorProcessor')

class Or extends Validator {
  constructor () {
    super('or')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'validate'
    ]
    this.supportedSettings = {}
  }

  async validate (context, validationSettings, registry) {
    return logicalConnectiveValidatorProcessor(context, validationSettings.validate, registry, 'Or')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Or
