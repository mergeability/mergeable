const { Validator } = require('./validator')
const deepValidation = require('./options_processor/deepValidation')

class Milestone extends Validator {
  constructor () {
    super('milestone')
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
      }
    }
  }

  async validate (context, validationSettings) {
    let milestone = this.getPayload(context).milestone ? this.getPayload(context).milestone.title : ''
    let output = await this.processOptions(
      validationSettings,
      milestone
    )

    // check PR body to see if closes an issue
    if (output.status === 'fail') {
      const res = deepValidation.checkIfClosesAnIssue(this.getPayload(context).body)
      if (res.length > 0) {
        const result = await deepValidation.checkIfIssueHaveProperty(context, res, 'milestone')
        result.forEach(issue => {
          const processed = this.processOptions(validationSettings, issue.title)
          output = processed
        })
      }
    }

    return output
  }
}

module.exports = Milestone
