const minimatch = require('minimatch')
const { Action } = require('./action')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')

const addLabels = async (context, issueNumber, labels) => {
  return context.github.issues.addLabels(
    context.repo({ issue_number: issueNumber, labels: {labels: labels} })
  )
}

const replaceLabels = async (context, issueNumber, labels) => {
  return context.github.issues.replaceLabels(
    context.repo({ issue_number: issueNumber, labels: {labels: labels} })
  )
}

const matchesPatterns = (label, patterns) => (
  patterns.some((pattern) => minimatch(label, pattern))
)

const deleteLabels = async (context, issueNumber, labels) => {
  let currentLabels = await context.github.issues.listLabelsOnIssue(
    context.repo({ issue_number: issueNumber })
  )
  // We get the current labels and filter out anything that matches
  // the patterns specified by the user
  let labelsToKeep = currentLabels.data.map(label => label.name).filter(label => !matchesPatterns(label, labels))
  return replaceLabels(context, issueNumber, labelsToKeep)
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
    let items = this.getActionables(context, results)

    let actions = {
      'add': addLabels,
      'delete': deleteLabels,
      'replace': replaceLabels
    }
    if (settings.mode && !Object.keys(actions).includes(settings.mode)) {
      throw new UnSupportedSettingError(`Unknown mode, supported modes are ${Object.keys(actions).join(', ')}`)
    }
    return Promise.all(
      items.map(issue => {
        actions[settings.mode || 'add'](
          context,
          issue.number,
          settings.labels
        )
      })
    )
  }
}

module.exports = Labels
