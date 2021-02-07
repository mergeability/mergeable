const andProcessor = require('../../../validators/options_processor/options/and')

class AndProcessor {
  static async process (context, filter, input, rule) {
    return andProcessor.process(filter, input, rule)
  }
}

module.exports = AndProcessor
