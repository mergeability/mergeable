const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')
const _ = require('lodash')

const updateItemWithComment = async (context, issueNumber, body, leaveOldComment) => {
  if (!leaveOldComment) {
    const oldComments = await fetchCommentsByMergeable(context, issueNumber)
    await deleteOldComments(context, oldComments)
  }
  return createComment(context, issueNumber, body)
}

const createComment = async (context, issueNumber, body) => {
  return context.github.issues.createComment(
    context.repo({ issue_number: issueNumber, body })
  )
}

const fetchCommentsByMergeable = async (context, issueNumber) => {
  const comments = await context.github.issues.listComments(
    context.repo({ issue_number: issueNumber })
  )

  const botName = process.env.APP_NAME ? process.env.APP_NAME : 'Mergeable'
  return comments.data.filter(comment => comment.user.login.toLowerCase() === `${botName.toLowerCase()}[bot]`)
}

const deleteOldComments = async (context, oldComments) => {
  for (let comment of oldComments) {
    await context.github.issues.deleteComment(
      context.repo({ comment_id: comment.id })
    )
  }
}

class Comment extends Action {
  constructor () {
    super('comment')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*',
      'schedule.repository'
    ]
  }

  async handleError (context, payload) {
    const issueNumber = this.getPayload(context).number

    await this.removeErrorComments(context)

    return createComment(
      context,
      issueNumber,
      payload.body
    )
  }

  async removeErrorComments (context) {
    if (_.isUndefined(this.getPayload(context))) return
    const issueNumber = this.getPayload(context).number
    const oldComments = await fetchCommentsByMergeable(context, issueNumber)
    const errorComments = oldComments.filter(comment => comment.body.toLowerCase().includes('error'))

    return deleteOldComments(context, errorComments)
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    let commentables = this.getActionables(context, results)

    return Promise.all(
      commentables.map(issue => {
        updateItemWithComment(
          context,
          issue.number,
          populateTemplate(settings.payload.body, results, issue),
          settings.leave_old_comment
        )
      })
    )
  }
}

module.exports = Comment
