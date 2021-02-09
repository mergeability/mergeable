const { Filter } = require('./filter')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')

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
      }
    }
  }

  async filter (context, settings) {
    let payload = this.getPayload(context)
    return this.processOptions(context, payload.user.login, settings)
  }
}

module.exports = Author
