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
      'issues.*',
      'schedule.repository'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    let items = this.getActionables(context, results)

    return Promise.all(
      items.map(issue => {
        closeIssue(
          context,
          issue.number
        )
      })
    )
  }
}

module.exports = Close
