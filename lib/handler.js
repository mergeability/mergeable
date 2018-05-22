const Configuration = require('../lib/configuration')
const fetch = require('node-fetch')

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

  static async handle (context, pullRequest) {
    // let the user know that we are validating if PR is mergeable
    context.github.repos.createStatus(
      statusInfo(context, pullRequest, 'pending', 'Validating...')
    )

    var config = await Configuration.instanceWithContext(context)

    let validators = []
    let excludes = (config.settings.mergeable.exclude)
      ? config.settings.mergeable.exclude.split(',').map(val => val.trim()) : []
    let includes = [ 'approvals', 'title', 'label', 'milestone', 'description', 'projects' ]
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

      context.github.repos.createStatus(
        statusInfo(context, pullRequest, status, description)
      )
      console.info({state: status, description: description})
    }).catch(error => {
      // (jusx) This should never ever happen. Log it.
      console.error(error)
    })
  }
}

const statusInfo = (context, pullRequest, status, description) => {
  return context.repo({
    sha: pullRequest.head.sha,
    state: status,
    target_url: 'https://github.com/apps/mergeable',
    description: description,
    context: 'Mergeable'
  })
}

module.exports = Handler
