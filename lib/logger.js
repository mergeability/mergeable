// Our log object is provided by probot and we only have access to it during run-time
// this module acts as a singleton for log object and needs to be initialized before using it
let logger

const logType = require('./utils/logTypes')

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
