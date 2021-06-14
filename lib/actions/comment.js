const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')
const logger = require('../logger')
const _ = require('lodash')

const updateItemWithComment = async (context, issueNumber, body, leaveOldComment, actionObj) => {
  if (!leaveOldComment) {
    const oldComments = await fetchCommentsByMergeable(context, issueNumber)
    await deleteOldComments(context, oldComments, actionObj)
  }
  return createComment(context, issueNumber, body)
}

const createComment = async (context, issueNumber, body) => {
  return context.octokit.issues.createComment(
    context.repo({ issue_number: issueNumber, body })
  )
}

const fetchCommentsByMergeable = async (context, issueNumber) => {
  const comments = await context.octokit.issues.listComments(
    context.repo({ issue_number: issueNumber })
  )

  const botName = process.env.APP_NAME ? process.env.APP_NAME : 'Mergeable'
  return comments.data.filter(comment => comment.user.login.toLowerCase() === `${botName.toLowerCase()}[bot]`)
}

const deleteOldComments = async (context, oldComments, actionObj) => {
  for (const comment of oldComments) {
    try {
      await context.octokit.issues.deleteComment(
        context.repo({ comment_id: comment.id })
      )
    } catch (err) {
      // if error is 404 (NotFound), skip it
      if (err.status !== '404') {
        const errorLog = {
          logType: logger.logTypes.DELETE_COMMENT_FAIL_ERROR,
          eventId: context.eventId,
          repo: context.payload.repository.full_name,
          actionName: actionObj.name,
          commentId: comment.id
        }

        actionObj.log.info(JSON.stringify(errorLog))
      }
    }
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

    await this.removeErrorComments(context, this)

    return createComment(
      context,
      issueNumber,
      payload.body
    )
  }

  async removeErrorComments (context, actionObj) {
    if (_.isUndefined(this.getPayload(context))) return
    const issueNumber = this.getPayload(context).number
    const oldComments = await fetchCommentsByMergeable(context, issueNumber)
    const errorComments = oldComments.filter(comment => comment.body.toLowerCase().includes('error'))

    return deleteOldComments(context, errorComments, actionObj)
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const commentables = this.getActionables(context, results)

    return Promise.all(
      commentables.map(issue => {
        updateItemWithComment(
          context,
          issue.number,
          populateTemplate(settings.payload.body, results, issue),
          settings.leave_old_comment,
          this
        )
      })
    )
  }
}

module.exports = Comment
