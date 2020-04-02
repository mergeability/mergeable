const EventAware = require('../eventAware')
const logger = require('../logger')

class Action extends EventAware {
  constructor (name) {
    super()
    this.name = name
    this.log = logger.create(`action/${name}`)
  }

  async beforeValidate () {
    throw new Error('class extending Action must implement beforeValidate function')
  }
  async afterValidate () {
    throw new Error('class extending Action must implement afterValidate function')
  }

  async processBeforeValidate (context, settings) {
    this.logBeforeValidateUsage(context, settings)
    return this.beforeValidate(context)
  }

  async processAfterValidate (context, settings, results) {
    this.logAfterValidateUsage(context, settings)
    return this.afterValidate(context, settings, results)
  }

  // intentionally do nothing. To be implemented by the inheriting Action classes.
  async run ({ context, settings, payload }) {}

  logBeforeValidateUsage (context, settings) {
    const usageLog = {
      log_type: logger.logTypes.ACTION_BEFORE_VALIDATE_EXECUTE,
      repo: context.payload.repository.full_name,
      action_name: this.name,
      settings
    }
    this.log.info(usageLog)
  }

  logAfterValidateUsage (context, settings) {
    const usageLog = {
      log_type: logger.logTypes.ACTION_AFTER_VALIDATE_EXECUTE,
      repo: context.payload.repository.full_name,
      action_name: this.name,
      settings
    }
    this.log.info(usageLog)
  }
}

module.exports = {
  Action
}
