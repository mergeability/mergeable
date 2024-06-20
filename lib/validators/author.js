const { Validator } = require('./validator')
const Teams = require('./options_processor/teams')
const ListProcessor = require('./options_processor/listProcessor')

class Author extends Validator {
  constructor () {
    super('author')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      must_include: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      team: 'string',
      one_of: 'array',
      none_of: 'array'
    }
  }

  async validate (context, settings) {
    const payload = this.getPayload(context)

    if (settings.team) {
      const result = await Teams.processTeamOption(context, settings, payload)
      if (result.status !== 'pass') {
        return result
      }
      delete settings.team
    }

    if (settings.one_of) {
      settings.one_of = await ListProcessor.process(settings.one_of, context)
    }
    if (settings.none_of) {
      settings.none_of = await ListProcessor.process(settings.none_of, context)
    }

    return this.processOptions(settings, payload.user.login)
  }
}

module.exports = Author
