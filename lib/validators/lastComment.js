const { Validator } = require('./validator')
const ListProcessor = require('./options_processor/listProcessor')
const _ = require('lodash')

class LastComment extends Validator {
  constructor () {
    super('lastComment')
    // Ignore 'issue_comment.deleted' to not validate what obviously isn't wanted anymore
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*',
      'issue_comment.created',
      'issue_comment.edited'
    ]
    this.supportedSettings = {
      must_include: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string'
      },
      comment_author: {
        one_of: 'array',
        none_of: 'array',
        no_bots: 'boolean'
      }
    }
  }

  async validate (context, validationSettings) {
    let excludeBots = true
    const commentAuthorOption = { do: validationSettings.do }
    if (validationSettings.comment_author) {
      if (validationSettings.comment_author.one_of) {
        commentAuthorOption.one_of = await ListProcessor.process(validationSettings.comment_author.one_of, context)
      }
      if (validationSettings.comment_author.none_of) {
        commentAuthorOption.none_of = await ListProcessor.process(validationSettings.comment_author.none_of, context)
      }
      if (validationSettings.comment_author.no_bots === false) {
        excludeBots = false
      }
    }
    delete validationSettings.comment_author

    // payload is the issue or pull_request that the comment was posted in
    const payload = this.getPayload(context)
    const issueNumber = payload.number
    let comments = []
    if (context.eventName === 'issue_comment') {
      // the single comment that got created/edited
      comments = [this.getPayload(context, true).comment]
    } else {
      // all the comments of the issue or pr
      comments = await this.githubAPI.listComments(context, issueNumber)
    }

    comments = await this.filterByCommentAuthor(comments, excludeBots, commentAuthorOption)

    return this.processOptions(
      validationSettings,
      comments.length ? comments[comments.length - 1].body : ''
    )
  }

  async filterByCommentAuthor (comments, excludeBots, commentAuthorOption) {
    let filteredComments = Array.from(comments)

    // exclude all GitHub bots by default
    if (excludeBots) {
      filteredComments = _.reject(filteredComments, c => c.user.login.toLowerCase().endsWith('[bot]'))
    }

    // for each comment, process comment_author option and drop those which don't pass
    if (commentAuthorOption) {
      const filtered = []
      for (const c of filteredComments) {
        const result = await this.processOptions(commentAuthorOption, c.user.login)
        if (result.status === 'fail') {
          filtered.push(c)
        }
      }
      filteredComments = _.difference(filteredComments, filtered)
    }

    return filteredComments
  }
}

module.exports = LastComment
