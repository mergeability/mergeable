const andOrProcessor = require('./lib/andOrProcessor')

class AndProcessor {
  static process (validatorContext, input, rule) {
    return andOrProcessor(validatorContext, input, rule, 'and')
  }
}

module.exports = AndProcessor
