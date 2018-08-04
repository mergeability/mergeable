const Handler = require('./lib/handler')
const createScheduler = require('probot-scheduler')

module.exports = (robot) => {
  setup(robot)

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

  robot.on('schedule.repository',
    context => Handler.handleStale(context)
  )
}

const setup = (robot) => {
  if (process.env.NODE_ENV === 'development') {
    robot.log.info('In DEVELOPMENT mode.')
    robot.log.info('Starting scheduler at 2 second intervals.')
    createScheduler(robot, { interval: 60 * 60 * 2 })
  } else {
    robot.log.info('In PRODUCTION mode.')
    robot.log.info('Starting scheduler at 1 hour intervals')
    createScheduler(robot)
  }
}
