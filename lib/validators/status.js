const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')

const MAX_ISSUES = 20 // max issues to retrieve each time.

class Status extends Validator {
  constructor () {
    super('status')
    this.supportedEvents = [
      'status.*'
    ]
    this.supportedSettings = {
      'checks': 'string'
    }
  }

  async validate (context, validationSettings, registry) {
    let commitSHA = context.payload['sha']
    let statusQuery = validationSettings.checks === 'all' ? 'status:success' : ''
    let results = await context.github.search.issuesAndPullRequests({
      q: `repo:${context.repo().owner}/${context.repo().repo} is:open ${commitSHA} ${statusQuery}`.trim(),
      sort: 'updated',
      order: 'desc',
      per_page: MAX_ISSUES
    })
    let relatedPullRequests = results.data.items.filter(item => item.pull_request)
    let status = relatedPullRequests.length > 0 ? 'pass' : 'fail'
    const result = {
      status: status,
      description: `Related PRs - ${relatedPullRequests.size}`
    }
    return constructOutput({name: 'Status'}, {relatedPullRequests}, validationSettings, result)
  }
}

module.exports = Status
