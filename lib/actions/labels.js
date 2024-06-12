const minimatch = require('minimatch')
const { Action } = require('./action')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')

const matchesPatterns = (label, patterns) => (
  patterns.some((pattern) => minimatch(label, pattern))
)

/**
 * @deprecated
 */
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
      'issue_comment.*',
      'schedule.repository'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const items = this.getActionables(context, results)

    if (settings.replace || settings.add || settings.delete) {
      return Promise.all(
        items.map(async issue => {
          let labels

          if (settings.replace) {
            labels = [].concat(settings.replace)
          } else {
            labels = await this.githubAPI.listLabelsOnIssue(context, issue.number)
          }

          if (settings.add) {
            labels = labels.concat(settings.add)
          }

          if (settings.delete) {
            labels = labels.filter(label => !matchesPatterns(label, [].concat(settings.delete)))
          }

          return this.githubAPI.setLabels(context, issue.number, labels)
        })
      )
    }

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
