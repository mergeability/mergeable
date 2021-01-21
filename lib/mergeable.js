const createScheduler = require('probot-scheduler')
const flexExecutor = require('./flex/flex')
const Context = require('./context')
const logger = require('./logger')
const _ = require('lodash')

require('colors')

function logEventReceived (context) {
  let log = logger.create('mergeable')

  const event = context.getEvent()

  const eventReceivedLog = {
    log_type: logger.logTypes.EVENT_RECEIVED,
    event_id: context.eventId,
    event
  }

  if (event.includes('installation')) {
    const installation = context.payload.installation

    let repositoriesAdded = []
    let repositoriesRemoved = []

    if (event === 'installation') {
      repositoriesAdded = context.payload.repositories.map(repo => repo.full_name)
    } else if (event === 'installation_repositories') {
      repositoriesAdded = context.payload.repositories_added.map(repo => repo.full_name)
      repositoriesRemoved = context.payload.repositories_removed.map(repo => repo.full_name)
    }

    Object.assign(eventReceivedLog, {
      installation_id: installation.id,
      account: installation.account.login,
      account_type: installation.account.type,
      repositories: { added: repositoriesAdded, removed: repositoriesRemoved },
      sender: context.payload.sender.login
    })
  }

  if (!(_.isUndefined(context.payload.repository))) {
    Object.assign(eventReceivedLog, {
      repo: context.payload.repository.full_name,
      url: context.payload.repository.html_url,
      isPrivate: context.payload.repository.private
    })
  }

  log.info(JSON.stringify(eventReceivedLog))
}

class Mergeable {
  constructor (mode) {
    this.mode = mode
  }

  start (robot) {
    let log = logger.create('mergeable')
    let scheduleIntervalSeconds = 2
    if (this.mode === 'development') {
      log.info('In DEVELOPMENT mode.')
    } else {
      log.info('In PRODUCTION mode.')
      scheduleIntervalSeconds = process.env.MERGEABLE_SCHEDULER_INTERVAL || 3600
    }

    if (process.env.MERGEABLE_SCHEDULER === 'true') {
      log.info('Starting scheduler at ' + scheduleIntervalSeconds + ' second intervals.')
      this.schedule(robot, { interval: scheduleIntervalSeconds * 1000 })
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
      logEventReceived(context)

      await flexExecutor(context)
    })
  }
}

module.exports = { Mergeable: Mergeable }
