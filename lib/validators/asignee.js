const { Validator } = require('./validator')

class Description extends Validator {
  constructor () {
    super()
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.unlabeled',
      'pull_request.synchronize',
      'issues.opened'
    ]
  }

  async validate (context, validationSettings) {
    let assignees = this.getPayload(context).assignees

    return this.processOptions(
      validationSettings,
      assignees
    )
  }
}

module.exports = Description
