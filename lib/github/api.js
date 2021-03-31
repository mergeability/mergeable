const logger = require('../logger')

const createLog = (context, option) => {
  return Object.assign({
    logType: logger.logTypes.UNKNOWN_GITHUB_API_ERROR,
    eventId: context.eventId,
    repo: context.payload.repository.full_name,
    event: `${context.eventName}.${context.payload.action}`
  }, option)
}

const checkCommonError = (err, context, callFn) => {
  const log = logger.create(`GithubAPI/${callFn}`)

  const errorLog = createLog(context, {callFn: callFn, errors: err.toString()})

  switch (err.status) {
    case 500:
      errorLog.logType = logger.logTypes.GITHUB_SERVER_ERROR
      break
    case 404:
      errorLog.logType = logger.logTypes.HTTP_NOT_FOUND_ERROR
      break
    default:
  }
  log.error(errorLog)
  throw err // bubble up the error so that the flow will break, unless it is need
}

const debugLog = (context, callFn) => {
  const log = logger.create(`GithubAPI/${callFn}`)
  const debugLog = createLog(context, { callFn, logType: logger.logTypes.GITHUB_API_DEBUG })
  log.debug(JSON.stringify(debugLog))
}

class GithubAPI {
  static async listFiles (context, callParams) {
    const callFn = 'pulls.listFiles'
    debugLog(context, callFn)

    return context.octokit.paginate(
      context.octokit.pulls.listFiles.endpoint.merge(
        callParams
      ),
      res => res.data
    ).catch((err) => {
      return checkCommonError(err, context, callFn)
    })
  }
}

module.exports = GithubAPI
