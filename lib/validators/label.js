const { Validator } = require('./validator')

class Label extends Validator {
  constructor () {
    super('label')
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
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
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
      },
      min: {
        count: 'number',
        message: 'string'
      },
      max: {
        count: 'number',
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    let labels = await this.githubAPI.listLabelsOnIssue(context, this.getPayload(context).number)

    return this.processOptions(
      validationSettings,
      labels
    )
  }
}

module.exports = Label
