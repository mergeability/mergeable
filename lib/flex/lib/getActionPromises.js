const createPromises = require('./createPromises')

const getActionPromises = (context, registry, rule, result) => {
  const actions = rule[result.validationStatus]
  if (actions) {
    const afterValidateFuncCall = (actionClass, context, action, name, result) => actionClass.processAfterValidate(context, action, name, result)

    return createPromises(actions, 'actions', afterValidateFuncCall, context, registry, rule.name, result)
  }
}

module.exports = getActionPromises
