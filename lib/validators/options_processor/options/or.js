const andOrProcessor = require('./lib/andOrProcessor')

class OrProcessor {
  static async process (validatorContext, input, rule) {
    return await andOrProcessor(validatorContext, input, rule, 'or')
  }
}

module.exports = OrProcessor
