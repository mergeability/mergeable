const { Validator } = require('./validator')

class HeadRef extends Validator {
  constructor() {
    super('headRef')
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

  async validate(context, validationSettings) {
    return this.processOptions(
      validationSettings,
      this.getPayload(context).head.ref
    )
  }
}

module.exports = HeadRef
