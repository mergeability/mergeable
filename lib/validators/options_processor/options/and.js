const andOrProcessor = require('./lib/andOrProcessor')

const andProcessor = (validatorContext, input, rule) => {
  return andOrProcessor(validatorContext, input, rule, 'and')
}

module.exports = andProcessor
