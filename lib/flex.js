const Configuration = require('./configuration/configuration')
const extractValidationStats = require('./stats/extractValidationStats')

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  // check config file and get settings only for the current event. the rest is useless for executor
  let eventName = `${context.event}.${context.payload.action}`
  await config.filterByEvent(eventName)
  // go through the settings and register all the validators
  await config.registerValidatorsAndActions(registry)

  // do pre validation actions
  await processPreActions(context, registry, config)

  config.settings.forEach(rule => {
    Promise.all(getValiatorPromises(context, registry, rule))
      .then((result) => {
        const translatedOutput = extractValidationStats(result)

        Promise.all(getActionPromises(context, registry, rule, translatedOutput))
      })
  })
}

const getValiatorPromises = (context, registry, rule) => {
  console.log(context)
  const validateFuncCall = (validator, context, validation) => validator.validate(context, validation)

  return createPromises(rule.validate, 'validators', validateFuncCall, context, registry)
}

// call all action classes' beforeValidate, regardless of whether they are in failure or pass situation
const processPreActions = async (context, registry, config) => {
  registry.actions.forEach(action => {
    action.beforeValidate({ context })
  })
}

const getActionPromises = (context, registry, rule, result) => {
  const actions = rule[result.validationStatus]

  const afterValidateFuncCall = (actionClass, context, action, result) => actionClass.afterValidate(context, action, result)

  return createPromises(actions, 'actions', afterValidateFuncCall, context, registry, result)
}

const createPromises = (arrayToIterate, registryName, funcCall, context, registry, result) => {
  let promises = []

  arrayToIterate.forEach(element => {
    let key = element.do

    let actionClass = registry[registryName].get(key)
    let eventName = `${context.event}.${context.payload.action}`

    if (actionClass.isEventSupported(eventName)) {
      promises.push(funcCall(actionClass, context, element, result))
    } // else add error for event not supported
  })
  return promises
}
module.exports = executeMergeable
