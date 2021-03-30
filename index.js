const { Mergeable } = require('./lib/mergeable')
const logger = require('./lib/logger')
const githubRateLimitEndpoint = require('./lib/utils/githubRateLimitEndpoint')
const prometheusMiddleware = require('express-prometheus-middleware')

module.exports = (robot, { getRouter }) => {
  const router = getRouter()

  if (process.env.ENABLE_GITHUB_RATELIMIT_ENDPOINT === 'true') {
    // endpoint to fetch github given installation rate limit
    router.get('/github-ratelimit/:installationId', githubRateLimitEndpoint(robot))
  }

  if (process.env.ENABLE_METRICS_ENDPOINT === 'true') {
    // expose prometheus metrics
    router.use(prometheusMiddleware())
  }

  logger.init(robot.log)
  let mergeable = new Mergeable(process.env.NODE_ENV)
  mergeable.start(robot)
}
