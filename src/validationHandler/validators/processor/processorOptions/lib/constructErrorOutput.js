const constructOuput = require('./constructOutput')

/**
 * Construct Error Output
 *
 * @author Shine Lee <aungshine@gmail.com>
 */

module.exports = (validatorContext, input, rule, error) => {
  return constructOuput(validatorContext, input, rule, {
    status: 'error',
    description: error
  })
}
