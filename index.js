const Configuration = require('./lib/configuration')
const fetch = require('node-fetch')

module.exports = (robot) => {
  robot.on(
    [ 'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.unlabeled',
      'pull_request.synchronize'
    ],
    handlePullRequest
  )

  robot.on(['issues.milestoned', 'issues.demilestoned'], handleIssues)

  // TODO abstract to lib and write tests.
  async function handleIssues (context) {
    if (context.payload.issue.pull_request) {
      let res = await fetch(context.payload.issue.pull_request.url)
      let pr = await res.json()
      handle(context, pr)
    }
  }

  async function handlePullRequest (context) {
    handle(context, context.payload.pull_request)
  }

  var handle = async (context, pullRequest) => {
    var config = await Configuration.instanceWithContext(context)
    robot.log(config)

    let validators = []
    let includes = [ 'approvals', 'title', 'label', 'milestone' ]

    includes.forEach(validator => {
      validators.push(require(`./lib/${validator}`)(pullRequest, context, config.settings))
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
