const { Filter } = require('./filter')
const andOrValidatorProcessor = require('./lib/andOrValidatorProcessor')

class And extends Filter {
  constructor () {
    super('and')
    this.supportedEvents = [
      '*'
    ]
    this.supportedOptions = [
      'filter'
    ]
    this.supportedSettings = {}
  }

  async filter (context, settings, registry) {
    return andOrValidatorProcessor(context, settings.filter, registry, 'And')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = And
