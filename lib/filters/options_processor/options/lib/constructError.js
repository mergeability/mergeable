const constructOuput = require('./constructOutput')

module.exports = (filter, input, rule, error, details) => {
  const result = {
    status: 'error',
    description: error
  }
  return constructOuput(filter, input, rule, result, details)
}
