const Configuration = require('./lib/configuration')

module.exports = (robot) => {
  robot.log('')
  robot.on(
    [ 'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.unlabeled'
    ],
    handle
  )

  async function handle (context) {
    var config = await Configuration.instanceWithContext(context)
    console.log(config)

    let validators = []
    let includes = [ 'approvals', 'title', 'label' ]
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
