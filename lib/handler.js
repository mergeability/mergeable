const Configuration = require('../lib/configuration')
const fetch = require('node-fetch')
const checks = require('../lib/checks')

class Handler {
  static async handleIssues (context) {
    if (context.payload.issue.pull_request) {
      let res = await fetch(context.payload.issue.pull_request.url)
      let pr = await res.json()
      return this.handle(context, pr)
    }
  }

  static async handlePullRequest (context) {
    return this.handle(context, context.payload.pull_request)
  }

  static async handleChecks (context) {
    // @TODO handle checks rerun calls
  }

  static async handle (context, pullRequest) {
    const checkRunResult = await checks.create(context, 'Mergeable')
    // let the user know that we are validating if PR is mergeable

    var config = await Configuration.instanceWithContext(context)

    let validators = []
    let excludes = (config.settings.mergeable.exclude)
      ? config.settings.mergeable.exclude.split(',').map(val => val.trim()) : []
    let includes = [ 'approvals', 'title', 'label', 'milestone', 'description', 'assignee' ]
      .filter(validator => excludes.indexOf(validator) === -1)

    includes.forEach(validator => {
      validators.push(require(`../lib/${validator}`)(pullRequest, context, config.settings))
    })

    console.info(config)
    return Promise.all(validators).then(results => {
      let failures = results.filter(validated => !validated.mergeable)

      let status, description
      if (failures.length === 0) {
        status = 'success'
        description = 'Okay to merge.'
      } else {
        status = 'failure'
        description = failures
          .map(validated => validated.description)
          .join(',\n')
      }

      checks.update(
        context,
        checkRunResult.data.id,
        'Mergeable',
        'completed',
        status,
        {
          title: `Result: ${status}`,
          summary: description})

      console.info({state: status, description: description})
    }).catch(error => {
      // (jusx) This should never ever happen. Log it.
      console.error(error)
    })
  }
}

module.exports = Handler
