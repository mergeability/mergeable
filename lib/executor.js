const Configuration = require('./configuration/configuration')
const extractValidationStats = require('./stats/extractValidationStats')

const SUPPORTED_VALIDATOR = [
  'title',
  'label'
]

const SUPPORTED_ACTIONS = [
  'comment',
  'checks'
]

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  // we can try to log stats here

  // Quick and dirty for now. Registry should be as a singleton that caches instances
  // of validators and actions - @jusx
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  // check config file and get settings only for the current event. the rest is useless for executor
  let eventName = `${context.event}.${context.payload.action}`
  config = filterByEvent(config, eventName)

  registerValidatorsAndActions(config, registry)

  processPreActions(context, registry, config)

  config.forEach(rule => {
    Promise.all(getValiationPromises(context, registry, rule))
      .then((result) => {
        const translatedOutput = extractValidationStats(result)

        Promise.all(getActionPromises(context, registry, rule, translatedOutput))
      })
  })
}

const filterByEvent = (config, eventName) => {
  let filteredConfig = []
  config.settings.mergeable.forEach(rule => {
    let events = Array.isArray(rule.when) ? rule.when : rule.when.split(',').map(n => n.trim())
    if (isEventInContext(eventName, events)) {
      filteredConfig.push(rule)
    }
  })

  return filteredConfig
}

const isEventInContext = (eventName, events) => {
  let eventObject = eventName.split('.')[0]
  return ((events.indexOf(eventName.trim()) > -1) ||
    (events.indexOf('pull_request.*') > -1 && eventObject === 'pull_request') ||
    (events.indexOf('issues.*') > -1 && eventObject === 'issues'))
}

const registerValidatorsAndActions = (config, registry) => {
  config.forEach(rule => {
    rule.validate.forEach(validation => {
      let key = validation.do
      if (!registry.validators.has(key)) {
        if (!SUPPORTED_VALIDATOR.includes(key)) {
          return // add validator not supported error
        }

        let Validator = require(`./validators/${key}`)
        registry.validators.set(key, new Validator())
      }
    })
    rule.fail.concat(rule.pass).forEach(action => {
      let key = action.do
      if (!registry.actions.has(key)) {
        if (!SUPPORTED_ACTIONS.includes(key)) {
          return // add validator not supported error
        }

        let Action = require(`./actions/${key}`)
        registry.actions.set(key, new Action())
      }
    })
  })
}

const getValiationPromises = (context, registry, rule) => {
  let promises = []
  rule.validate.forEach(validation => {

    let key = validation.do

    let validator = registry.validators.get(key)
    let eventName = `${context.event}.${context.payload.action}`

    if (validator.isEventSupported(eventName)) {
      promises.push(validator.validate(context, validation))
    } // else add error for event not supported
  })

  return promises
}

// call all action classes' preAction, regardless of whether they are in failure or pass situation
const processPreActions = async (context, registry, config) => {
  registry.actions.forEach(action => {
    action.doPreAction({ context })
  })
}

const getActionPromises = (context, registry, rule, result) => {
  const actions = rule[result.validationStatus]

  let promises = []
  actions.forEach(action => {
    let key = action.do

    let actionClass = registry.actions.get(key)
    let eventName = `${context.event}.${context.payload.action}`

    if (actionClass.isEventSupported(eventName)) {
      promises.push(actionClass.doPostAction(context, action, result))
    } // else add error for event not supported
  })

  return promises
}

module.exports = executeMergeable
