const { Mergeable } = require('./lib/mergeable')

module.exports = (robot) => {
  let mergeable = new Mergeable(process.env.NODE_ENV)
  mergeable.start(robot)
}
