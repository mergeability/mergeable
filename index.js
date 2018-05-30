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

  // check every two seconds.
  scheduler(robot, { interval: 60 * 60 * 2 })
  robot.on('schedule.repository',
    context => Handler.handleStale(context)
  )
}
