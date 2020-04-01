const EventAware = require('../eventAware')
const options = require('./options_processor/options')
const logger = require('../logger')

const DEFAULT_SUPPORTED_OPTIONS = [
  'and',
  'or',
  'begins_with',
  'ends_with',
  'max',
  'min',
  'must_exclude',
  'must_include',
  'no_empty',
  'required'
]

class Validator extends EventAware {
  constructor (name) {
    super()
    this.processor = options
    this.name = name
    this.log = logger.create(`validator/${name}`)
    this.supportedOptions = DEFAULT_SUPPORTED_OPTIONS
  }

  async validate () {
    throw new Error('Class extending validator must implement validate function')
  }

  processOptions (vSettings, value, supportedOptions) {
    return options.process({
      name: vSettings.do,
      supportedOptions: supportedOptions || DEFAULT_SUPPORTED_OPTIONS
    }, value, vSettings)
  }

  logUsage (context, settings) {
    const usageLog = {
      log_type: logger.logTypes.VALIDATOR_PROCESS,
      repo: context.payload.repository.full_name,
      validator_name: this.name,
      settings
    }
    this.log.info(usageLog)
  }
}

module.exports = {
  Validator: Validator
}
