const listProcessor = require('../../../validators/options_processor/listProcessor')
const noneOf = require('../../../validators/options_processor/options/none_of')

class NoneOf {
  static async process (context, filter, input, rule) {
    const candidates = await listProcessor.process(rule.none_of, context)
    return noneOf.process(filter, input, { none_of: candidates })
  }
}

module.exports = NoneOf
