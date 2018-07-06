const Handler = require('./lib/handler')
const scheduler = require('probot-scheduler')

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
    context => Handler.handlePullRequest(context)
  )

  robot.on(['issues.milestoned', 'issues.demilestoned'],
    context => Handler.handleIssues(context)
  )

  robot.on(['issues.opened'],
    (context) => { Handler.handleIssuesOpened(context) }
  )

  // By default scan check every one hour.
  // to debug locally you may want to change it to
  // run on 2 sec interval like so: scheduler(robot, { interval: 60 * 60 * 2 })
  robot.on('schedule.repository',
    context => Handler.handleStale(context)
  )
}
