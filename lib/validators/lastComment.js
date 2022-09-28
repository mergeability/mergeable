const { Validator } = require('./validator')

class LastComment extends Validator {
  constructor () {
    super('lastComment')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*',
      'issue_comment.*'
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
      }
    }
  }

  async validate (context, validationSettings) {
    const comments = (await this.githubAPI.listComments(context, this.getPayload(context).number)).data

    return this.processOptions(
      validationSettings,
      comments.length ? comments[comments.length - 1].body : ''
    )
  }
}

module.exports = LastComment
