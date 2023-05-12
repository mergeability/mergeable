const { Validator } = require('./validator')
const Teams = require('./options_processor/teams')
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
      team: 'string'
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

    return this.processOptions(settings, payload.user.login)
  }
}

module.exports = Author
