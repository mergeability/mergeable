const { Validator } = require('./validator')
const moment = require('moment-timezone')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')

const checkAge = (now, timeToCompare, settings) => {
  const validatorContext = { name: 'age' }
  const diff = now.diff(moment(timeToCompare))
  const isMergeable = (moment.duration(diff).asDays() >= settings.days)

  const result = {
    status: isMergeable ? 'pass' : 'fail',
    description: isMergeable ? 'Your PR is old enough to merge' : settings.message || 'Your PR is not old enough to be merged yet'
  }

  return constructOutput(validatorContext, timeToCompare, settings, result)
}

class Age extends Validator {
  constructor () {
    super('time')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      updated_at: {
        days: 'number',
        message: 'string'
      },
      created_at: {
        days: 'number',
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    const payload = this.getPayload(context)
    const now = moment().utc(false)
    const output = []
    const validatorContext = { name: 'age' }

    if (validationSettings.created_at) {
      output.push(checkAge(now, payload.created_at, validationSettings.created_at))
    }

    if (validationSettings.updated_at) {
      output.push(checkAge(now, payload.updated_at, validationSettings.updated_at))
    }

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Age
