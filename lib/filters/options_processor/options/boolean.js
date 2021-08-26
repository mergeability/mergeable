const booleanMatch = require('../../../validators/options_processor/options/boolean')

class BooleanMatch {
  static process (context, filter, input, rule) {
    return booleanMatch.process(filter, input, rule)
  }
}

module.exports = BooleanMatch
