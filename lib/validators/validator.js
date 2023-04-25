const _ = require('lodash')
const EventAware = require('../eventAware')
const options = require('./options_processor/options')
const logger = require('../logger')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const GithubAPI = require('../github/api')

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
  'required',
  'jira',
  'team'
]

class Validator extends EventAware {
  constructor (name) {
    super()
    this.processor = options
    this.name = name
    this.log = logger.create(`validator/${name}`)
    this.supportedOptions = DEFAULT_SUPPORTED_OPTIONS
    this.githubAPI = GithubAPI
  }

  async validate () {
    throw new Error('Class extending validator must implement validate function')
  }

  async processValidate (context, validationSettings, registry) {
    if (!this.supportedSettings) {
      throw new Error('Class extending validators must provide supported Settings')
    }

    this.logUsage(context, validationSettings)
    try {
      this.validateSettings(this.supportedSettings, validationSettings)
    } catch (err) {
      if (err instanceof UnSupportedSettingError) {
        const validatorContext = { name: this.name }
        const output = [constructErrorOutput(validatorContext, JSON.stringify(this.supportedSettings), validationSettings, `${err.name}`, err)]
        return consolidateResult(output, validatorContext)
      } else {
        throw err
      }
    }

    return this.validate(context, validationSettings, registry)
  }

  async processOptions (vSettings, value, supportedOptions) {
    return options.process({
      name: vSettings.do,
      supportedOptions: supportedOptions || DEFAULT_SUPPORTED_OPTIONS
    }, value, vSettings)
  }

  logUsage (context, settings) {
    const usageLog = {
      logType: logger.logTypes.VALIDATOR_PROCESS,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      validatorName: this.name,
      settings: JSON.stringify(settings)
    }
    this.log.info(JSON.stringify(usageLog))
  }

  validateSettings (supportedSettings, settingToCheck, nestings = []) {
    const supportedSettingKeys = Object.keys(supportedSettings)

    for (const key of Object.keys(settingToCheck)) {
      if (key === 'do' || key === 'and' || key === 'or') continue
      if (!supportedSettingKeys.includes(key)) {
        throw new UnSupportedSettingError(`validator/${this.name}: ${nestings.join('.')}${nestings.length > 0 ? '.' : ''}${key} option is not supported`)
      }
      const optionType = getOptionType(settingToCheck[key])
      if (optionType === 'object') {
        this.validateSettings(supportedSettings[key], settingToCheck[key], nestings.concat([key]))
      } else if (!supportedSettings[key].includes(optionType)) {
        throw new UnSupportedSettingError(`validator/${this.name}: ${nestings.join('.')}${nestings.length > 0 ? '.' : ''}${key} is expected to be of type: ${supportedSettings[key]}`)
      }
    }
  }
}

const getOptionType = (option) => {
  if (typeof option === 'object' && _.isArray(option)) {
    return 'array'
  }
  return typeof option
}

module.exports = {
  Validator: Validator
}
