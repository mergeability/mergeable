const andOrProcessor = require('./lib/andOrProcessor')

class AndProcessor {
  static async process (validatorContext, input, rule) {
    return andOrProcessor(validatorContext, input, rule, 'and')
  }
}

module.exports = AndProcessor
