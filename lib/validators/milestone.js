const { Validator } = require('./validator')
const deepValidation = require('./options_processor/deepValidation')

class Milestone extends Validator {
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
    let milestone = this.getPayload(context).milestone ? this.getPayload(context).milestone.title : ''

    let output = this.processOptions(
      validationSettings,
      milestone
    )
    console.log('output', output)
    // check PR body to see if closes an issue
    if (output.status === 'fail') {
      const res = deepValidation.checkIfClosesAnIssue(this.getPayload(context).body)

      if (res.length > 0) {
        const result = await deepValidation.checkIfIssueHaveProperty(context, res, 'milestone', validationSettings)
        if (result) {
          output = result
        }
      }
    }

    return output
  }
}

module.exports = Milestone
