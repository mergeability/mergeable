const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')
const _ = require('lodash')

const updateItemWithComment = async (context, issueNumber, body, leaveOldComment, actionObj) => {
  if (!leaveOldComment) {
    const oldComments = await fetchCommentsByMergeable(context, issueNumber, actionObj)
    await deleteOldComments(context, oldComments, actionObj)
  }
  return actionObj.githubAPI.createComment(context, issueNumber, body)
}

const fetchCommentsByMergeable = async (context, issueNumber, actionObj) => {
  const comments = await actionObj.githubAPI.listComments(context, issueNumber)

  const botName = process.env.APP_NAME ? process.env.APP_NAME : 'Mergeable'
  return comments.filter(comment => comment.user.login.toLowerCase() === `${botName.toLowerCase()}[bot]`)
}

const deleteOldComments = async (context, oldComments, actionObj) => {
  for (const comment of oldComments) {
    await actionObj.githubAPI.deleteComment(context, comment.id)
  }
}

class Comment extends Action {
  constructor () {
    super('comment')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*',
      'issue_comment.*',
      'schedule.repository'
    ]
  }

  async handleError (context, payload) {
    const issueNumber = this.getPayload(context).number

    await this.removeErrorComments(context, this)

    return this.githubAPI.createComment(
      context,
      issueNumber,
      payload.body
    )
  }

  async removeErrorComments (context, actionObj) {
    if (_.isUndefined(this.getPayload(context))) return
    const issueNumber = this.getPayload(context).number
    const oldComments = await fetchCommentsByMergeable(context, issueNumber, this)
    const errorComments = oldComments.filter(comment => comment.body.toLowerCase().includes('error'))

    return deleteOldComments(context, errorComments, actionObj)
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const commentables = this.getActionables(context, results)
    const evt = this.getEventAttributes(context)

    return Promise.all(
      // eslint-disable-next-line array-callback-return
      commentables.map(issue => {
        updateItemWithComment(
          context,
          issue.number,
          populateTemplate(settings.payload.body, results, issue, evt),
          settings.leave_old_comment,
          this
        )
      })
    )
  }
}

module.exports = Comment
