const orProcessor = require('../../../validators/options_processor/options/or')

class OrProcessor {
  static async process (context, filter, input, rule) {
    return orProcessor.process(filter, input, rule)
  }
}

module.exports = OrProcessor
