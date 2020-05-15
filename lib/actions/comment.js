const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')

const createComment = async (context, issueNumber, body) => {
  return context.github.issues.createComment(
    context.repo({ issue_number: issueNumber, body })
  )
}

const fetchCommentsByMergeable = async (context, issueNumber) => {
  const comments = await context.github.issues.listComments(
    context.repo({ issue_number: issueNumber })
  )

  const botName = process.env.BOT_NAME ? process.env.BOT_NAME : 'Mergeable'

  return comments.data.filter(comment => comment.user.login === `${botName}[bot]`)
}

const deleteOldComments = async (context, issueNumber) => {
  const oldComments = await fetchCommentsByMergeable(context, issueNumber)

  for (let comment of oldComments) {
    console.log(comment)
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

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    if (settings.old_comment !== 'leave') {
      await deleteOldComments(context, this.getPayload(context).number)
    }

    let scheduleResults = results.validationSuites && results.validationSuites[0].schedule
    let commentables = (scheduleResults)
      ? scheduleResults.issues.concat(scheduleResults.pulls)
      : [this.getPayload(context)]

    return Promise.all(
      commentables.map(issue => {
        createComment(
          context,
          issue.number,
          populateTemplate(settings.payload.body, results)
        )
      })
    )
  }
}

module.exports = Comment
