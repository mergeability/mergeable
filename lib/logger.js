// Our log object is provided by probot and we only have access to it during run-time
// this module acts as a singleton for log object and needs to be initialized before using it
const bunyan = require('bunyan')

let logger
const logTypes = {
  EVENT_RECEIVED: 'event_received',
  CONFIG_INVALID_YML: 'config_invalid_yml',
  UNKNOWN_ERROR_VALIDATOR: 'unknown_error_validator',
  UNKNOWN_ERROR_ACTION: 'unknown_error_action'
}

function create (name = 'mergeable') {
  if (logger === undefined) {
    if (process.env.NODE_ENV === 'test') {
      return bunyan.createLogger({name: 'mergeable-test'})
    }
    throw Error('Logger has not been initialized')
  }

  return logger.child({ name })
}

function init (log) {
  if (logger !== undefined) {
    throw Error('Logger has already been initialized, no need to initialize it again')
  }

  logger = log
  log.info('Logger Successfully initialized')
}

module.exports = {
  create,
  init,
  logTypes
}
