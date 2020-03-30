const { Validator } = require('./validator')

class Assignee extends Validator {
  constructor () {
    super('assignee')
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.unlabeled',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.synchronize',
      'issues.*'
    ]
  }

  async validate (context, validationSettings) {
    let assignees = this.getPayload(context).assignees

    return this.processOptions(
      validationSettings,
      assignees.map(assignee => assignee.login)
    )
  }
}

module.exports = Assignee
