const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')

const MAX_ISSUES = 20 // max issues to retrieve each time.

class Stale extends Validator {
  constructor () {
    super('stale')
    this.supportedEvents = [
      'schedule.repository'
    ]
  }

  async validate (context, validationSettings) {
    let days = validationSettings.days || 20
    let typeSetting = validationSettings.type || ['issue', 'pr']
    let types = Array.isArray(typeSetting) &&
      typeSetting.filter(type => type === 'issues' || type === 'pull_request')
    types = types || [typeSetting]
    types = types.map(type => {
      if (type === 'issues') return 'issue'
      if (type === 'pull_request') return 'pr'
    })

    let typeQuery = (types.length === 1) ? ` type:${types[0]}` : ''
    let secs = days * 24 * 60 * 60 * 1000
    let timestamp = new Date(new Date() - secs)
    timestamp = timestamp.toISOString().replace(/\.\d{3}\w$/, '')

    let results = await context.github.search.issuesAndPullRequests({
      q: `repo:${context.repo().owner}/${context.repo().repo} is:open updated:<${timestamp}${typeQuery}`,
      sort: 'updated',
      order: 'desc',
      per_page: MAX_ISSUES
    })

    let items = results.data.items

    let scheduleResult = {
      issues: items.filter(item => !item.pull_request),
      pulls: items.filter(item => item.pull_request)
    }

    return getResult(scheduleResult, { days: days, types: types }, validationSettings)
  }
}

const getResult = (scheduleResult, input, settings) => {
  let isPass = scheduleResult.issues.length > 0 ||
    scheduleResult.pulls.length > 0
  let name = 'stale'
  let status = isPass ? 'pass' : 'fail'

  return {
    status: status,
    name: name,
    validations: constructOutput(
      name,
      status,
      input,
      settings
    ),
    schedule: scheduleResult
  }
}

module.exports = Stale
