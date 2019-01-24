const createScheduler = require('probot-scheduler')
const Handler = require('./handler')
const flexExecutor = require('./flex')
const _ = require('lodash')

require('colors')

class Mergeable {
  constructor (mode, version = 'genesis') {
    this.mode = mode
    this.version = version
  }

  start (robot) {
    let log = robot.log.child({name: 'mergeable'})
    let intervalSecs = 2
    if (this.mode === 'development') {
      log.info('In DEVELOPMENT mode.')
    } else {
      log.info('In PRODUCTION mode.')
      intervalSecs = 1000
    }

    if (process.env.MERGEABLE_SCHEDULER === 'true') {
      log.info('Starting scheduler at 2 second intervals.')
      this.schedule(robot, { interval: 60 * 60 * intervalSecs })
    } else {
      log.info(`Scheduler: ${'off'.bold.white}!`)
    }

    log.info(`Version: ${this.version.bold.white}`)

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
      let log = context.log.child({name: 'mergeable'})
      if (_.isUndefined(context.payload.repository)) {
        log.warn('Unable to log repository name. There is no repository in the payload:')
        log.warn(context.payload)
      } else {
        log.info({Repo: context.payload.repository.full_name,
          url: context.payload.repository.html_url,
          private: context.payload.repository.private})
      }
      log.info({event: context.event, action: context.payload.action})
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
