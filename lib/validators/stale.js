const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const moment = require('moment-timezone')

const dayOfTheWeek = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]

const MAX_ISSUES = 20 // max issues to retrieve each time.

class Stale extends Validator {
  constructor () {
    super('stale')
    this.supportedEvents = [
      'schedule.repository'
    ]
    this.supportedSettings = {
      days: 'number',
      type: 'array',
      label: {
        match: 'array',
        ignore: 'array'
      },
      ignore_drafts: 'boolean',
      ignore_milestones: 'boolean',
      ignore_projects: 'boolean',
      time_constraint: {
        time_zone: 'string',
        hours_between: 'array',
        days_of_week: 'array'
      }
    }
  }

  async validate (context, validationSettings) {
    if (validationSettings.time_constraint) {
      const timeOptions = validationSettings.time_constraint
      const now = moment().utc(false)

      if (timeOptions.time_zone) now.tz(timeOptions.time_zone)
      if (timeOptions.days_of_week && !timeOptions.days_of_week.includes(dayOfTheWeek[now.day()])) return craftFailOutput(validationSettings)
      if (timeOptions.hours_between && timeOptions.hours_between.length === 2) {
        const hourNow = now.hour()
        if (hourNow < timeOptions.hours_between[0] || hourNow > timeOptions.hours_between[1]) return craftFailOutput(validationSettings)
      }
    }

    const days = validationSettings.days || 20
    const typeSetting = validationSettings.type || ['issue', 'pr']
    let types = Array.isArray(typeSetting) &&
      typeSetting.filter(type => type === 'issues' || type === 'pull_request')
    types = types || [typeSetting]
    // eslint-disable-next-line array-callback-return
    types = types.map(type => {
      if (type === 'issues') return 'issue'
      if (type === 'pull_request') return 'pr'
    })

    const typeQuery = (types.length === 1) ? ` type:${types[0]}` : ''
    const secs = days * 24 * 60 * 60 * 1000
    let timestamp = new Date(new Date() - secs)
    timestamp = timestamp.toISOString().replace(/\.\d{3}\w$/, '')

    const label = validationSettings.label || {}
    const labelMatchQuery = (label.match || []).map(label => `label:"${label}"`)
    const labelIgnoreQuery = (label.ignore || []).map(label => `-label:"${label}"`)
    let ignoreQuery = ''
    if (validationSettings.ignore_drafts) {
      ignoreQuery += '-is:draft '
    }
    if (validationSettings.ignore_milestones) {
      ignoreQuery += 'no:milestone '
    }
    if (validationSettings.ignore_projects) {
      ignoreQuery += 'no:project '
    }
    const labelQuery = labelMatchQuery.concat(labelIgnoreQuery).join(' ')
    const items = await this.githubAPI.searchIssuesAndPR(context, {
      q: `repo:${context.repo().owner}/${context.repo().repo} is:open updated:<${timestamp}${typeQuery} ${labelQuery} ${ignoreQuery}`.trim(),
      sort: 'updated',
      order: 'desc',
      per_page: MAX_ISSUES
    })

    const scheduleResult = {
      issues: items.filter(item => !item.pull_request),
      pulls: items.filter(item => item.pull_request)
    }

    return getResult(scheduleResult, { days: days, types: types }, validationSettings)
  }
}

const craftFailOutput = (validationSettings) => {
  return {
    status: 'fail',
    name: 'stale',
    validations: constructOutput(
      'stale',
      'fail',
      validationSettings,
      validationSettings
    )
  }
}

const getResult = (scheduleResult, input, settings) => {
  const isPass = scheduleResult.issues.length > 0 ||
    scheduleResult.pulls.length > 0
  const name = 'stale'
  const status = isPass ? 'pass' : 'fail'

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
