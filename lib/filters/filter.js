const _ = require('lodash')
const EventAware = require('../eventAware')
const logger = require('../logger')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')
const options = require('./options_processor/options')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructError')

const DEFAULT_SUPPORTED_OPTIONS = [
  'visibility',
  'topics'
]

class Filter extends EventAware {
  constructor (name) {
    super()
    this.name = name
    this.options = options
    this.log = logger.create(`filter/${name}`)
    this.supportedOptions = DEFAULT_SUPPORTED_OPTIONS
  }

  async filter () {
    throw new Error('Class extending filter must implement filter function')
  }

  async processFilter (context, settings, registry) {
    if (!this.supportedSettings) {
      throw new Error('Class extending filters must provide supported Settings')
    }

    this.logUsage(context, settings)
    try {
      this.validateSettings(this.supportedSettings, settings)
    } catch (err) {
      if (err instanceof UnSupportedSettingError) {
        const filterContext = {name: this.name}
        const output = [constructError(filterContext, JSON.stringify(this.supportedSettings), settings, `${err.name}`, err)]
        return consolidateResult(output, filterContext)
      } else {
        throw err
      }
    }

    return this.filter(context, settings, registry)
  }

  processOptions (context, settings) {
    let filter = {
      name: settings.do,
      supportedOptions: this.supportedOptions
    }
    return this.options.process(context, filter, settings)
  }

  logUsage (context, settings) {
    const usageLog = {
      logType: logger.logTypes.FILTER_PROCESS,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      filterName: this.name,
      settings: JSON.stringify(settings)
    }
    this.log.info(JSON.stringify(usageLog))
  }

  validateSettings (supportedSettings, settingToCheck, nestings = []) {
    const supportedSettingKeys = Object.keys(supportedSettings)

    for (let key of Object.keys(settingToCheck)) {
      if (key === 'do' || key === 'and' || key === 'or') continue
      if (!supportedSettingKeys.includes(key)) {
        throw new UnSupportedSettingError(`filter/${this.name}: ${nestings.join('.')}${nestings.length > 0 ? '.' : ''}${key} option is not supported`)
      }
      const optionType = getOptionType(settingToCheck[key])
      if (optionType === 'object') {
        this.validateSettings(supportedSettings[key], settingToCheck[key], nestings.concat([key]))
      } else if (!supportedSettings[key].includes(optionType)) {
        throw new UnSupportedSettingError(`filter/${this.name}: ${nestings.join('.')}${nestings.length > 0 ? '.' : ''}${key} is expected to be of type: ${supportedSettings[key]}`)
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
  Filter: Filter
}
