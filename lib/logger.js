// Our log object is provided by probot and we only have access to it during run-time
// this module acts as a singleton for log object and needs to be initialized before using it
let logger

const logType = {
  EVENT_RECEIVED: 'event_received',
  CONFIG_INVALID_YML: 'config_invalid_yml',
  UNKNOWN_ERROR_VALIDATOR: 'unknown_error_validator',
  UNKNOWN_ERROR_ACTION: 'unknown_error_action',
  VALIDATOR_PROCESS: 'validator_process',
  ACTION_BEFORE_VALIDATE_EXECUTE: 'action_before_validate_execute',
  ACTION_AFTER_VALIDATE_EXECUTE: 'action_after_validate_execute',
  CONFIG: 'config'
}

class Logger {
  static get logTypes () {
    return logType
  }

  static create (name = 'mergeable') {
    if (logger === undefined) {
      throw Error('Logger has not been initialized')
    }

    return logger.child({ name })
  }

  static init (log) {
    if (logger !== undefined) {
      throw Error('Logger has already been initialized, no need to initialize it again')
    }

    logger = log
    log.info('Logger Successfully initialized')
  }
}

module.exports = Logger
