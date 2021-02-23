const { Validator } = require('./validator')
const moment = require('moment-timezone')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')

class Time extends Validator {
  constructor () {
    super('time')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      age: {
        seconds: 'number',
        use_updated_at: 'boolean',
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    const payload = this.getPayload(context)
    const now = moment().utc(false)
    let timeToCompare = moment(payload.created_at)

    if (validationSettings.age.use_updated_at) {
      timeToCompare = moment(payload.updated_at)
    }
    const diff = now.diff(timeToCompare)
    const isMergeable = (moment.duration(diff).asSeconds() >= validationSettings.age.seconds)
    const result = {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? 'Your PR is old enough to merge' : validationSettings.age.message || 'Your PR is not old enough to be merged yet'
    }

    const validatorContext = {name: 'time'}
    const output = [constructOutput(validatorContext, timeToCompare, validationSettings, result)]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Time
