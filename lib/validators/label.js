const { Validator } = require('./validator')

class Label extends Validator {
  constructor() {
    super()
    this.supportedEvents = [ 'pull_request.opened',
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

  async validate(context, validationSettings) {
    let labels = await context.github.issues.getIssueLabels(
      context.repo({ number: this.getPayload(context) })
    )

    return this.processOptions(
      validationSettings,
      labels.data.map(label => label.name)
    )
  }
}

module.exports = Label
