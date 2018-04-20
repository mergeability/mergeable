const Configuration = require('./lib/configuration')

module.exports = (robot) => {
  robot.on(
    [
      'issues.milestoned'
    ],
    context => {
      console.log(context.payload.issue.pull_request)
    }
  )
  robot.on(
    [ 'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.unlabeled',
      'pull_request.assigned',
      'pull_request.unassigned'
    ],
    handle
  )

  async function handle (context) {
    var config = await Configuration.instanceWithContext(context)
    robot.log(config)

    let validators = []
    let includes = [ 'approvals', 'title', 'label', 'milestone' ]
    includes.forEach(validator => {
      validators.push(require(`./lib/${validator}`)(context, config.settings))
    })

    Promise.all(validators).then((results) => {
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
        sha: context.payload.pull_request.head.sha,
        state: status,
        target_url: 'https://github.com/apps/mergeable',
        description: description,
        context: 'Mergeable'
      }))
    })
  }
}
