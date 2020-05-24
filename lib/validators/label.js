const { Validator } = require('./validator')

class Label extends Validator {
  constructor () {
    super('label')
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
    this.supportedSettings = {
      no_empty: {
        enabled: 'boolean',
        message: 'string'
      },
      must_include: {
        regex: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
        message: 'string'
      },
      begins_with: {
        regex: 'string',
        message: 'string'
      },
      ends_with: {
        regex: 'string',
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
    let labels = await context.github.issues.listLabelsOnIssue(
      context.repo({ issue_number: this.getPayload(context).number })
    )

    return this.processOptions(
      validationSettings,
      labels.data.map(label => label.name)
    )
  }
}

module.exports = Label
