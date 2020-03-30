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
  }

  async validate (context, validationSettings, registry) {
    return andOrValidatorProcessor(context, validationSettings.validate, registry, 'And')
  }
}

module.exports = And
