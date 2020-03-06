const { Action } = require('./action')

const addAssignees = async (context, issueNumber, assignees) => {
  return context.github.issues.addAssignees(
    context.repo({ issue_number: issueNumber, assignees })
  )
}

const checkAssignee = async (context, issueNumber, assignee) => {
  const checkResult = await context.github.issues.checkAssignee(
    context.repo({ issue_number: issueNumber, assignee })
  ).catch(err => {
    if (err.status === 404) return { status: 404 }
  })

  return checkResult.status === 204 ? assignee : null
}

class Assign extends Action {
  constructor () {
    super()
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
    const assignees = settings.assignees
    const checkResults = await Promise.all(assignees.map(assignee => checkAssignee(context, issueNumber, assignee)))

    const authorizedAssignees = checkResults.filter(assignee => assignee !== null)

    return addAssignees(context, issueNumber, authorizedAssignees)
  }
}

module.exports = Assign
