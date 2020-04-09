const { Action } = require('./action')

const closeIssue = async (context, issueNumber) => {
  return context.github.issues.update(
    context.repo({ issue_number: issueNumber, state: 'closed' })
  )
}

class Close extends Action {
  constructor () {
    super('close')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    const payload = this.getPayload(context)
    const issueNumber = payload.number

    return closeIssue(
      context,
      issueNumber
    )
  }
}

module.exports = Close
