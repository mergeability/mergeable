const { Validator } = require('./validator')

class Title extends Validator {
  constructor () {
    super('title')
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
      'issues.*'
    ]
    this.supportedSettings = {
      no_empty: {
        enabled: Boolean,
        message: String
      },
      must_include: {
        regex: String,
        message: String
      },
      must_exclude: {
        regex: String,
        message: String
      },
      begins_with: {
        regex: String,
        message: String
      },
      ends_with: {
        regex: String,
        message: String
      },
      min: {
        count: Number,
        message: String
      },
      max: {
        count: Number,
        message: String
      }
    }
  }

  async validate (context, validationSettings) {
    return this.processOptions(
      validationSettings,
      this.getPayload(context).title
    )
  }
}

module.exports = Title
