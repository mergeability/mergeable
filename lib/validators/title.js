const { Validator } = require('./validator')

class Title extends Validator {
  constructor () {
    super()
    this.supportedEvents = [ 'pull_request.opened',
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
      'issues.opened'
    ]
  }

  validate (context, validationSettings) {
    return this.processOptions(
      validationSettings,
      this.getPayload(context).title
    )
  }
}

module.exports = Title
