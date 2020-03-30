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

  // intentionally do nothing. To be implemented by the inheriting Action classes.
  async run ({ context, settings, payload }) {}

  logBeforeValidateUsage (settings) {
    const usageLog = {
      log_type: logger.logTypes.ACTION_BEFORE_VALIDATE_EXECUTE,
      action_name: this.name,
      settings
    }
    this.log.info(usageLog)
  }

  logAfterValidateUsage (settings) {
    const usageLog = {
      log_type: logger.logTypes.ACTION_AFTER_VALIDATE_EXECUTE,
      action_name: this.name,
      settings
    }
    this.log.info(usageLog)
  }
}

module.exports = {
  Action
}
