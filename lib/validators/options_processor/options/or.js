const andOrProcessor = require('./lib/andOrProcessor')

class OrProcessor {
  static process (validatorContext, input, rule) {
    return andOrProcessor(validatorContext, input, rule, 'or')
  }
}

module.exports = OrProcessor
