const { Validator } = require('./validator')

class Title extends Validator {
  constructor () {
    super('title')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*'
    ]
    this.supportedSettings = {
      no_empty: {
        enabled: 'boolean',
        message: 'string'
      },
      jira: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_include: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string'
      },
      begins_with: {
        match: ['string', 'array'],
        message: 'string'
      },
      ends_with: {
        match: ['string', 'array'],
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    return this.processOptions(
      validationSettings,
      this.getPayload(context).title
    )
  }
}

module.exports = Title
