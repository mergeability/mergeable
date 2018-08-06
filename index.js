const Mergeable = require('./lib/mergeable')

module.exports = (robot) => {
  let mergeable = new Mergeable(
    process.env.NODE_ENV,
    process.env.MERGEABLE_VERSION
  )

  mergeable.start(robot)
}
