const { Filter } = require('./filter')
const logicalConnectiveValidatorProcessor = require('./lib/logicalConnectiveValidatorProcessor')

class Or extends Filter {
  constructor () {
    super('or')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'filter'
    ]
    this.supportedSettings = {}
  }

  async filter (context, settings, registry) {
    return logicalConnectiveValidatorProcessor(context, settings.filter, registry, 'Or')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Or
