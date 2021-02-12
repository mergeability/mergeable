const { Filter } = require('./filter')
const andOrValidatorProcessor = require('./lib/andOrValidatorProcessor')

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
    return andOrValidatorProcessor(context, settings.filter, registry, 'Or')
  }

  // skip validating settings
  validateSettings (supportedSettings, settingToCheck) {}
}

module.exports = Or
