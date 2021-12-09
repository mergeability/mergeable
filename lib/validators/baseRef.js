const { Validator } = require('./validator')
const consolidateResults = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')

class BaseRef extends Validator {
  constructor () {
    super('baseRef')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'check_suite.*',
      'status.*'
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
      mediaType: {
        previews: 'array'
      }
    }
  }

  async validate (context, validationSettings) {
    const payload = this.getPayload(context)

    const mediaType = validationSettings.mediaType
    delete validationSettings.mediaType

    if (context.eventName === 'check_suite') {
      return this.validateCheckSuite(payload, validationSettings)
    }

    if (context.eventName === 'status') {
      return this.validateStatus(context, validationSettings, mediaType)
    }

    return this.processOptions(validationSettings, payload.base.ref)
  }

  async validateCheckSuite (payload, validationSettings) {
    // A check_suite's payload contains multiple pull_requests
    // Need to make sure that each pull_request's base ref is valid
    return this.validatePullRequests(payload.pull_requests, validationSettings)
  }

  async validateStatus (context, validationSettings, mediaType) {
    // The commit associated with a status can belong to multiple pull_requests
    // Need to make sure that each "open" pull_request's base ref is valid
    const request = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      commit_sha: context.payload.sha
    }

    if (mediaType) {
      request.mediaType = mediaType
    }

    const pulls = await context.octokit.request(
      'GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls',
      request
    )

    const openPullRequests = pulls.data.filter(pullRequest => pullRequest.state === 'open')

    return this.validatePullRequests(openPullRequests, validationSettings)
  }

  async validatePullRequests (pullRequests, validationSettings) {
    const validatorContext = { name: 'baseRef' }
    const baseRefs = pullRequests.map(pullRequest => pullRequest.base.ref)

    // If an event has NO associated pull requests it is considered
    // a failed validation since there is no baseRef to validate
    if (baseRefs.length === 0) {
      return constructOutput({ name: 'baseRef' }, undefined, validationSettings, { status: 'fail', description: 'No pull requests associated with event' })
    }

    const results = await Promise.all(baseRefs.map(
      baseRef => this.processOptions(validationSettings, baseRef)
    ))

    return consolidateResults(results, validatorContext)
  }
}

module.exports = BaseRef
