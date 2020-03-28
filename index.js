const { Mergeable } = require('./lib/mergeable')
const logger = require('./lib/logger')

module.exports = (robot) => {
  logger.init(robot.log)
  let mergeable = new Mergeable(process.env.NODE_ENV)
  mergeable.start(robot)
}
