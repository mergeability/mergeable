const createScheduler = require('probot-scheduler')
const Handler = require('./handler')
const flexExecutor = require('./flex')
require('colors')

class Mergeable {
  constructor (mode, version) {
    this.mode = mode
    this.version = version || 'genesis'
  }

  start (robot) {
    if (this.mode === 'development') {
      robot.log.info('In DEVELOPMENT mode.')
      robot.log.info('Starting scheduler at 2 second intervals.')
      this.schedule(robot, { interval: 60 * 60 * 2 })
    } else {
      robot.log.info('In PRODUCTION mode.')
      robot.log.info('Starting scheduler at 1 hour intervals')
      this.schedule(robot, { interval: 60 * 60 * 1000 })
    }

    robot.log.info(`Version: ${this.version.bold.white}`)

    if (this.version === 'flex') {
      this.flex(robot)
    } else {
      this.genesis(robot)
    }
  }

  schedule (robot, options) {
    createScheduler(robot, options)
  }

  // version 2 of mergeable WIP as we refactor the code base.
  flex (robot) {
    robot.on('*', async context => {
      context.log.info({event: context.event, action: context.payload.action})
      flexExecutor(context)
    })
  }

  genesis (robot) {
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
}

module.exports = { Mergeable: Mergeable }
