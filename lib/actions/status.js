const { Action } = require('./action')

class Status extends Action {
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
      'pull_request.synchronize'
    ]
  }

  async doPreAction (context, settings) {
  }

  async doPostAction (context, settings) {

  }

  async validate (context, validationSettings) {
    let labels = await context.github.issues.getIssueLabels(
      context.repo({ number: this.getPayload(context).number })
    )

    return this.processOptions(
      validationSettings,
      labels.data.map(label => label.name)
    )
  }
}

module.exports = Status
