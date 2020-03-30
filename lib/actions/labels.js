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
      'issues.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    this.logAfterValidateUsage(settings)
    const payload = this.getPayload(context)
    const issueNumber = payload.number

    const labelsToCreate = {
      labels: settings.labels
    }

    return addLabels(
      context,
      issueNumber,
      labelsToCreate
    )
  }
}

module.exports = Labels
