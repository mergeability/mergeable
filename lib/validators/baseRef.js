const { Validator } = require('./validator')
const consolidateResults = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')

class BaseRef extends Validator {
  constructor () {
    super('baseRef')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'check_suite.*'
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
    const payload = this.getPayload(context)

    if (context.eventName === 'check_suite') {
      return this.validateCheckSuite(payload, validationSettings)
    }

    return this.processOptions(validationSettings, payload.base.ref)
  }

  async validateCheckSuite (payload, validationSettings) {
    // A check_suite's payload contains multiple pull_requests
    // Need to make sure that each pull_request's base ref is valid
    const validatorContext = { name: 'baseRef' }
    const baseRefs = payload.pull_requests.map(pullRequest => pullRequest.base.ref)

    // If a check_suite has NO associated pull requests it is considered
    // a failed validation since there is no baseRef to validate
    if (baseRefs.length === 0) {
      return constructOutput({ name: 'baseRef' }, undefined, validationSettings, { status: 'fail', description: 'No pull requests associated with check_suite' })
    }

    const results = await Promise.all(baseRefs.map(
      baseRef => this.processOptions(validationSettings, baseRef)
    ))

    return consolidateResults(results, validatorContext)
  }
}

module.exports = BaseRef
