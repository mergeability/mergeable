const { Validator } = require('./validator')

class Changeset extends Validator {
  constructor () {
    super('changeset')
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
      'pull_request.synchronize'
    ]
  }

  async validate (context, validationSettings) {
    // fetch the file list
    let result = await context.github.pulls.listFiles(context.repo({pull_number: this.getPayload(context).number}))
    let changedFiles = result.data.map(file => file.filename)

    return this.processOptions(validationSettings, changedFiles)
  }
}

module.exports = Changeset
