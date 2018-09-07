const { Validator } = require('./validator')

class Stale extends Validator {
  constructor () {
    super()
    this.supportedEvents = [
      'schedule.repository'
    ]
  }

  async validate (context, validationSettings) {
    let event = `${context.event}`

    let type = 'issue'
    if (event === 'pull_request') {
      type = 'pr'
    } else return

    await search(context, validationSettings, type)
  }
}

const search = async (context, config, type = 'issue') => {
  const MAX_ISSUES = 20 // max issues to retrieve each time.

  let secs = config.days * 24 * 60 * 60 * 1000
  let timestamp = new Date(new Date() - secs)
  timestamp = timestamp.toISOString().replace(/\.\d{3}\w$/, '')

  let results = await context.github.search.issues({
    q: `repo:${context.repo().owner}/${context.repo().repo} is:open updated:<${timestamp} type:${type}`,
    sort: 'updated',
    order: 'desc',
    per_page: MAX_ISSUES
  })

  results.data.items.forEach(issue => {
    context.github.issues.createComment(
      context.repo({number: issue.number, body: config.message})
    )
  })
}

module.exports = Stale
