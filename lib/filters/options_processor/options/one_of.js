const listProcessor = require('../../../validators/options_processor/listProcessor')
const oneOf = require('../../../validators/options_processor/options/one_of')

class OneOf {
  static async process (context, filter, input, rule) {
    const candidates = await listProcessor.process(rule.one_of, context)
    return oneOf.process(filter, input, { one_of: candidates })
  }
}

module.exports = OneOf
