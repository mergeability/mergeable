const constructOuput = require('./constructOutput')

module.exports = (filter, rule, error, details) => {
  let result = {
    status: 'error',
    description: error
  }
  return constructOuput(filter, rule, result, details)
}
