const andOrProcessor = require('./lib/andOrProcessor')

const orProcessor = (validatorContext, input, rule) => {
  return andOrProcessor(validatorContext, input, rule, 'or')
}

module.exports = orProcessor
