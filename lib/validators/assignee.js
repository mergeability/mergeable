const { Validator } = require('./validator')

class Assignee extends Validator {
  constructor () {
    super('assignee')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*'
    ]

    this.supportedSettings = {
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
    let assignees = this.getPayload(context).assignees

    return await this.processOptions(
      validationSettings,
      assignees.map(assignee => assignee.login)
    )
  }
}

module.exports = Assignee
