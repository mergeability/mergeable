const createPromises = require('./createPromises')

const getValidatorPromises = (context, registry, rule) => {
  const validateFuncCall = (validator, context, validation) => validator.processValidate(context, validation, registry)

  return createPromises(rule.validate, 'validators', validateFuncCall, context, registry)
}

module.exports = getValidatorPromises
