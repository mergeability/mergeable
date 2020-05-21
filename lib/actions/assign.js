const { Action } = require('./action')

const addAssignees = async (context, issueNumber, assignees) => {
  return context.github.issues.addAssignees(
    context.repo({ issue_number: issueNumber, assignees })
  )
}

const isValidAssignee = (assignee) => {
  return assignee.status === 204
}

const checkAssignee = async (context, issueNumber, assignee) => {
  const checkResult = await context.github.issues.checkAssignee(
    context.repo({ issue_number: issueNumber, assignee })
  ).catch(err => {
    if (err.status === 404) return { status: 404 }
  })

  return isValidAssignee(checkResult) ? assignee : null
}

const mapSpecialAssignee = async (payload, assignee) => {
  if (assignee.toLowerCase() === '@author') {
    return payload.user.login
  }
  return assignee
}

class Assign extends Action {
  constructor () {
    super('assign')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const payload = this.getPayload(context)
    const issueNumber = payload.number
    const assignees = await Promise.all(settings.assignees.map(assignee => mapSpecialAssignee(payload, assignee)))
    const checkResults = await Promise.all(assignees.map(assignee => checkAssignee(context, issueNumber, assignee)))

    const authorizedAssignees = checkResults.filter(assignee => assignee !== null)

    return addAssignees(context, issueNumber, authorizedAssignees)
  }
}

module.exports = Assign
