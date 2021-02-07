const _ = require('lodash')

const createCheckName = (name) => {
  return _.isUndefined(name) ? 'Mergeable' : `Mergeable: ${name}`
}

module.exports = createCheckName
