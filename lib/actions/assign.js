const { Action } = require('./action')
const searchAndReplaceSpecialAnnotations = require('./lib/searchAndReplaceSpecialAnnotation')

class Assign extends Action {
  constructor () {
    super('assign')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*',
      'issue_comment.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const evt = this.getEventAttributes(context)
    const payload = this.getPayload(context)
    const issueNumber = payload.number
    const assignees = settings.assignees.map(assignee => searchAndReplaceSpecialAnnotations(assignee, payload, evt))
    const checkResults = await Promise.all(assignees.map(
      assignee => assignee === payload.user.login
        ? assignee
        : this.githubAPI.checkUserCanBeAssigned(context, issueNumber, assignee)))

    const authorizedAssignees = checkResults.filter(assignee => assignee !== null)

    return this.githubAPI.addAssignees(context, issueNumber, authorizedAssignees)
  }
}

module.exports = Assign
