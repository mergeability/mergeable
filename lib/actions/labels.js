const minimatch = require('minimatch')
const { Action } = require('./action')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')

const matchesPatterns = (label, patterns) => (
  patterns.some((pattern) => minimatch(label, pattern))
)

const deleteLabels = async (context, issueNumber, labels, actionObj) => {
  const currentLabels = await actionObj.githubAPI.listLabelsOnIssue(context, issueNumber)
  // We get the current labels and filter out anything that matches
  // the patterns specified by the user
  const labelsToKeep = currentLabels.filter(label => !matchesPatterns(label, labels))
  return actionObj.githubAPI.setLabels(context, issueNumber, labelsToKeep)
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
    const items = this.getActionables(context, results)

    const actions = {
      add: this.githubAPI.addLabels,
      delete: deleteLabels,
      replace: this.githubAPI.setLabels
    }
    if (settings.mode && !Object.keys(actions).includes(settings.mode)) {
      throw new UnSupportedSettingError(`Unknown mode, supported modes are ${Object.keys(actions).join(', ')}`)
    }
    return Promise.all(
      // eslint-disable-next-line array-callback-return
      items.map(issue => {
        actions[settings.mode || 'add'](
          context,
          issue.number,
          settings.labels,
          this
        )
      })
    )
  }
}

module.exports = Labels
