const { Validator } = require('./validator')
const logicalConnectiveValidatorProcessor = require('./lib/logicalConnectiveValidatorProcessor')

class Not extends Validator {
  constructor () {
    super('not')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'validate'
    ]
    this.supportedSettings = {}
  }

  async validate (context, validationSettings, registry) {
    return logicalConnectiveValidatorProcessor(context, validationSettings.validate, registry, 'Not')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Not
