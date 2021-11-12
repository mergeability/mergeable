const { Filter } = require('./filter')

class BaseRef extends Filter {
  constructor () {
    super('baseRef')
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
    const payload = this.getPayload(context)
    return this.processOptions(context, payload.base.ref, settings)
  }
}

module.exports = BaseRef
