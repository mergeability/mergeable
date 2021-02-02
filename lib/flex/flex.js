const Configuration = require('../configuration/configuration')
const logAndProcessConfigErrors = require('./lib/logAndProcessConfigErrors')
const interceptors = require('../interceptors')
const processWorkflow = require('./lib/processWorkflow')

const logger = require('../logger')

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  if (registry === undefined) {
    registry = { filters: new Map(), validators: new Map(), actions: new Map() }
  }

  // interceptors
  await interceptors(context)

  // If whitelisted repos environment variables is defined
  if (process.env.WHITELISTED_REPOS) {
    const repoName = context.payload.repository.full_name
    const whitelistedRepos = process.env.WHITELISTED_REPOS.split(',')

    if (!whitelistedRepos.includes(repoName)) {
      let log = logger.create('mergeable')
      log.info(repoName + ' is not whitelisted with WHITELISTED_REPOS environment variable')
      return false
    }
  }

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  if (config.hasErrors()) {
    return logAndProcessConfigErrors(context, config)
  }

  if (process.env.LOG_CONFIG) {
    const log = logger.create('flex')
    const configLog = {
      logType: logger.logTypes.CONFIG,
      eventId: context.eventId,
      repo: context.payload.repository.full_name,
      settings: JSON.stringify(config.settings)
    }

    log.info(JSON.stringify(configLog))
  }

  await processWorkflow(context, registry, config)
}

module.exports = executeMergeable
