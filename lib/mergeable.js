const createScheduler = require('probot-scheduler')
const flexExecutor = require('./flex')
const Context = require('./context')
const _ = require('lodash')

require('colors')

class Mergeable {
  constructor (mode) {
    this.mode = mode
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

    this.flex(robot)
  }

  schedule (robot, options) {
    createScheduler(robot, options)
  }

  // version 2 of mergeable.
  flex (robot) {
    robot.on('*', async pContext => {
      let context = new Context(pContext)
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
      await flexExecutor(context)
    })
  }
}

module.exports = { Mergeable: Mergeable }
