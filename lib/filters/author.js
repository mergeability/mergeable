const { Filter } = require('./filter')

class Author extends Filter {
  constructor () {
    super('author')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      must_include: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      team: 'string'
    }
  }

  async filter (context, settings) {
    const payload = this.getPayload(context)
    return this.processOptions(context, payload.user.login, settings)
  }
}

module.exports = Author
