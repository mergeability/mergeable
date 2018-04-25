const Configuration = require('../lib/configuration')
const fetch = require('node-fetch')

class Handler {
  static async handleIssues (context) {
    if (context.payload.issue.pull_request) {
      let res = await fetch(context.payload.issue.pull_request.url)
      let pr = await res.json()
      this.handle(context, pr)
    }
  }

  static async handlePullRequest (context) {
    this.handle(context, context.payload.pull_request)
  }

  static async handle (context, pullRequest) {
    var config = await Configuration.instanceWithContext(context)
    console.log(config)

    let validators = []
    let includes = [ 'approvals', 'title', 'label', 'milestone' ]

    includes.forEach(validator => {
      validators.push(require(`../lib/${validator}`)(pullRequest, context, config.settings))
    })

    Promise.all(validators).then(async (results) => {
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

      context.github.repos.createStatus(context.repo({
        sha: pullRequest.head.sha,
        state: status,
        target_url: 'https://github.com/apps/mergeable',
        description: description,
        context: 'Mergeable'
      }))
    })
  }
}

module.exports = Handler
