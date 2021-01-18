const andOrProcessor = require('./lib/andOrProcessor')

class AndProcessor {
  static async process (validatorContext, input, rule) {
    return await andOrProcessor(validatorContext, input, rule, 'and')
  }
}

module.exports = AndProcessor
