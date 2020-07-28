const Configuration = require('../configuration/configuration')
const logAndProcessConfigErrors = require('./lib/logAndProcessConfigErrors')
const interceptors = require('../interceptors')
const processWorkflow = require('./lib/processWorkflow')

const logger = require('../logger')

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  // interceptors
  await interceptors(context)

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  if (config.hasErrors()) {
    return logAndProcessConfigErrors(context, config)
  }

  if (process.env.LOG_CONFIG) {
    const log = logger.create('flex')
    const configLog = {
      log_type: logger.logTypes.CONFIG,
      repo: context.payload.repository.full_name,
      settings: JSON.stringify(config.settings)
    }

    log.info(JSON.stringify(configLog))
  }

  await processWorkflow(context, registry, config)
}

module.exports = executeMergeable
