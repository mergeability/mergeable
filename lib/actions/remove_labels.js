const { Action } = require('./action')

const removeLabels = async (context, issueNumber, labels) => {
  return Promise.all(
    labels.map(label => {
      context.github.issues.removeLabel(
        context.repo({ issue_number: issueNumber, name: label })
      )
    })
  )
}

class RemoveLabels extends Action {
  constructor () {
    super('remove_labels')
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

    const labelsToRemove = settings.labels
    return Promise.all(
      items.map(issue => {
        removeLabels(
          context,
          issue.number,
          labelsToRemove
        )
      })
    )
  }
}

module.exports = RemoveLabels
