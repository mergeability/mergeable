const Configuration = require('./configuration/configuration')
const extractValidationStats = require('./stats/extractValidationStats')

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  // go through the settings and register all the validators
  await config.registerValidatorsAndActions(registry)

  // do pre validation actions
  await processPreActions(context, registry, config)

  // process each rule found in configuration
  config.settings.forEach(rule => {
    if (isEventInContext(rule.when, context)) {
      Promise.all(getValiatorPromises(context, registry, rule))
        .then((result) => {
          const translatedOutput = extractValidationStats(result)
          Promise.all(getActionPromises(context, registry, rule, translatedOutput))
        })
    }
  })
}

const getValiatorPromises = (context, registry, rule) => {
  const validateFuncCall = (validator, context, validation) => validator.validate(context, validation)

  return createPromises(rule.validate, 'validators', validateFuncCall, context, registry)
}

// call all action classes' beforeValidate, regardless of whether they are in failure or pass situation
const processPreActions = async (context, registry, config) => {
  let promises = []
  registry.actions.forEach(action => {
    if (action.isEventSupported(`${context.event}.${context.payload.action}`)) {
      promises.push(action.beforeValidate({ context }))
    }
  })

  await Promise.all(promises)
}

const getActionPromises = (context, registry, rule, result) => {
  const actions = rule[result.validationStatus]
  const afterValidateFuncCall = (actionClass, context, action, result) => actionClass.afterValidate(context, action, result)

  return createPromises(actions, 'actions', afterValidateFuncCall, context, registry, result)
}

const isEventInContext = (event, context) => {
  let eventArray = event.split(', ')
  let contextEvent = `${context.event}.${context.payload.action}`
  let found = eventArray.find(element => {
    if (element.split('.')[1] === '*') {
      return element.includes(context.event)
    } else {
      return element === contextEvent
    }
  })

  return !!found
}

const createPromises = (arrayToIterate, registryName, funcCall, context, registry, result) => {
  let promises = []
  arrayToIterate.forEach(element => {
    let key = element.do

    let klass = registry[registryName].get(key)
    let eventName = `${context.event}.${context.payload.action}`
    if (klass.isEventSupported(eventName)) {
      promises.push(funcCall(klass, context, element, result))
    } // else add error for event not supported
  })
  return promises
}
module.exports = executeMergeable
