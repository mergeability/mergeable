const { Action } = require('./action')

const addLabels = async (context, issueNumber, labels) => {
  return context.github.issues.addLabels(
    context.repo({ issue_number: issueNumber, labels })
  )
}

class Labels extends Action {
  constructor () {
    super('labels')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*',
      'schedule.repository'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    let scheduleResults = results && results.validationSuites && results.validationSuites[0].schedule
    let items = (scheduleResults)
      ? scheduleResults.issues.concat(scheduleResults.pulls)
      : [this.getPayload(context)]

    const labelsToCreate = {
      labels: settings.labels
    }
    return Promise.all(
      items.map(issue => {
        addLabels(
          context,
          issue.number,
          labelsToCreate
        )
      })
    )
  }
}

module.exports = Labels
