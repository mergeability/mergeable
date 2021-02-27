const logger = require('../logger')

const createLog = (err, context, option) => {
  return Object.assign({
    logType: logger.logTypes.UNKNOWN_GITHUB_API_ERROR,
    eventId: context.eventId,
    errors: err.toString(),
    repo: context.payload.repository.full_name,
    event: `${context.eventName}.${context.payload.action}`
  }, option)
}

const checkKnownError = (err, log, ErrorLog) => {
  switch (err.status) {
    case '500':
      ErrorLog.logType = logger.logTypes.GITHUB_SERVER_ERROR
      log.info(ErrorLog)
      break
    case '404':
      ErrorLog.logType = logger.logTypes.HTTP_NOT_FOUND_ERROR
      log.info(ErrorLog)
      break
    default:
      log.error(ErrorLog)
      throw err // bubble it up so that it'll create an unknown error check
  }
}

class GithubAPI {
  static async listFiles (context, callParams, log) {
    return context.octokit.paginate(
      context.octokit.pulls.listFiles.endpoint.merge(
        callParams
      ),
      res => res.data
    ).catch((err) => {
      checkKnownError(err, context, createLog(err, context, {callFn: 'pulls.listFiles'}))
    })
  }
}

module.exports = GithubAPI
