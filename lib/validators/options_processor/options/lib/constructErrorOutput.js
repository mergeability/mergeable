const constructOuput = require('./constructOutput')

module.exports = (validatorContext, input, rule, error) => {
  return constructOuput(validatorContext, input, rule, {
    status: 'error',
    description: error
  })
}
