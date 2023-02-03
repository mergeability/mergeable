const { Filter } = require('./filter')
const logicalConnectiveValidatorProcessor = require('./lib/logicalConnectiveValidatorProcessor')

class Not extends Filter {
  constructor () {
    super('not')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'filter'
    ]
    this.supportedSettings = {}
  }

  async filter (context, settings, registry) {
    return logicalConnectiveValidatorProcessor(context, settings.filter, registry, 'Not')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Not
