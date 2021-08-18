const EventAware = require('../eventAware')
const logger = require('../logger')
const GithubAPI = require('../github/api')

class Action extends EventAware {
  constructor (name) {
    super()
    this.name = name
    this.log = logger.create(`action/${name}`)
    this.githubAPI = GithubAPI
  }

  async beforeValidate () {
    throw new Error('class extending Action must implement beforeValidate function')
  }

  async afterValidate () {
    throw new Error('class extending Action must implement afterValidate function')
  }

  async processBeforeValidate (context, settings, name) {
    this.logBeforeValidateUsage(context, settings)
    return this.beforeValidate(context, settings, name)
  }

  async processAfterValidate (context, settings, name, results) {
    this.logAfterValidateUsage(context, settings)
    return this.afterValidate(context, settings, name, results)
  }

  // intentionally do nothing. To be implemented by the inheriting Action classes.
  async run ({ context, settings, payload }) {}

  logBeforeValidateUsage (context, settings) {
    const usageLog = {
      logType: logger.logTypes.ACTION_BEFORE_VALIDATE_EXECUTE,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      actionName: this.name,
      settings: JSON.stringify(settings)
    }
    this.log.info(JSON.stringify(usageLog))
  }

  logAfterValidateUsage (context, settings) {
    const usageLog = {
      logType: logger.logTypes.ACTION_AFTER_VALIDATE_EXECUTE,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      actionName: this.name,
      settings: JSON.stringify(settings)
    }
    this.log.info(JSON.stringify(usageLog))
  }

  /**
   * Returns the actionable issues and/or pulls if it's for a schedule event. Otherwise return the current issue or pull that is for the current event.
   */
  getActionables (context, results) {
    const scheduleResults = (context.eventName === 'schedule')
      ? results && results.validationSuites && results.validationSuites.length && results.validationSuites[0].schedule
      : null
    const actionables = (scheduleResults)
      ? scheduleResults.issues.concat(scheduleResults.pulls)
      : [this.getPayload(context)]

    return actionables
  }
}

module.exports = {
  Action
}
