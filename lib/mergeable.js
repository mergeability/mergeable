const createScheduler = require('../scheduler/index')
const flexExecutor = require('./flex/flex')
const Context = require('./context')
const logger = require('./logger')
const _ = require('lodash')
const { GithubRateLimitRemainingTotal, GithubRateLimitLimitTotal } = require('./stats/githubPrometheusStats')

require('colors')

function logEventReceived (context) {
  const log = logger.create('mergeable')

  const event = context.getEvent()

  const eventReceivedLog = {
    logType: logger.logTypes.EVENT_RECEIVED,
    eventId: context.eventId,
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
      installationId: installation.id,
      account: installation.account.login,
      accountType: installation.account.type,
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

function statEventReceived (context) {
  context.octokit.hook.after('request', async (response) => {
    GithubRateLimitRemainingTotal.labels({
      installationId: context.payload.installation.id
    }).set(Number(response.headers['x-ratelimit-remaining']))

    GithubRateLimitLimitTotal.labels({
      installationId: context.payload.installation.id
    }).set(Number(response.headers['x-ratelimit-limit']))
  })
}

class Mergeable {
  constructor (mode) {
    this.mode = mode
  }

  start (robot) {
    const log = logger.create('mergeable')
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
    robot.onAny(async pContext => {
      const context = new Context(pContext)
      logEventReceived(context)
      statEventReceived(context)

      await flexExecutor(context)
    })
  }
}

module.exports = { Mergeable: Mergeable }
