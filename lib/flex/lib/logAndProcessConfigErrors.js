const Configuration = require('../../configuration/configuration')
const Checks = require('../../actions/checks')

const logger = require('../../logger')

const logAndProcessConfigErrors = (context, config) => {
  const log = logger.create('flex')
  const event = `${context.eventName}.${context.payload.action}`
  const errors = config.errors

  let checks = new Checks()
  if (!checks.isEventSupported(event)) return

  let checkRunParam = {
    context: context,
    payload: {
      status: 'completed',
      conclusion: 'cancelled',
      output: {
        title: 'Invalid Configuration',
        summary: formatErrorSummary(errors)
      },
      completed_at: new Date()
    }
  }

  const configErrorLog = {
    log_type: logger.logTypes.CONFIG_INVALID_YML,
    errors,
    repo: context.payload.repository.full_name,
    event,
    settings: JSON.stringify(config.settings)
  }

  if (errors.has(Configuration.ERROR_CODES.NO_YML)) {
    checkRunParam.payload.conclusion = 'success'
    checkRunParam.payload.output = {
      title: 'No Config file found',
      summary: 'To enable Mergeable, please create a .github/mergeable.yml' +
        '\n\nSee the [documentation](https://github.com/mergeability/mergeable) for details on configuration.'
    }

    configErrorLog.log_type = logger.logTypes.CONFIG_NO_YML
  }

  log.info(JSON.stringify(configErrorLog))

  return checks.run(checkRunParam)
}

const formatErrorSummary = (errors) => {
  let it = errors.values()
  let summary = `Errors were found in the configuration (${Configuration.FILE_NAME}):`
  let message = it.next()
  while (!message.done) {
    summary += '\n- ' + message.value
    message = it.next()
  }
  summary += '\n\nSee the [documentation](https://github.com/mergeability/mergeable) for details on configuration.'
  return summary
}

module.exports = logAndProcessConfigErrors
