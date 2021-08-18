const { Action } = require('./action')

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
    const items = this.getActionables(context, results)

    return Promise.all(
      // eslint-disable-next-line array-callback-return
      items.map(issue => {
        this.githubAPI.updateIssues(
          context,
          issue.number,
          'closed'
        )
      })
    )
  }
}

module.exports = Close
