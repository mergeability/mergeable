const { Filter } = require('./filter')
const Teams = require('../validators/options_processor/teams')
class Author extends Filter {
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

  async filter (context, settings) {
    const payload = this.getPayload(context)

    if (settings.team) {
      const result = await Teams.processTeamOption(context, settings, payload)
      if (result.status !== 'pass') {
        return result
      }
      delete settings.team
    }

    return this.processOptions(context, payload.user.login, settings)
  }
}

module.exports = Author
