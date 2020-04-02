const { Validator } = require('./validator')

class Description extends Validator {
  constructor () {
    super('description')
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.synchronize',
      'issues.*'
    ]
  }

  async validate (context, validationSettings) {
    let description = this.getPayload(context).body

    return this.processOptions(
      validationSettings,
      description
    )
  }
}

module.exports = Description
