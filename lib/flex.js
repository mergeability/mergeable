const Configuration = require('./configuration/configuration')
const extractValidationStats = require('./stats/extractValidationStats')
const Checks = require('./actions/checks')
const Comment = require('./actions/comment')
const Register = require('./register')
const interceptors = require('./interceptors')
const consolidateResult = require('./validators/options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('./validators/options_processor/options/lib/constructErrorOutput')
const logger = require('./logger')
const _ = require('lodash')

// Main logic Processor of mergeable
const executeMergeable = async (context, registry) => {
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  // interceptors
  await interceptors(context)

  // first fetch the configuration
  let config = await Configuration.instanceWithContext(context)

  if (config.hasErrors()) {
    return logAndProcessConfigErrors(context, config)
  }

  if (process.env.LOG_CONFIG) {
    const log = logger.create('flex')
    const configLog = {
      log_type: logger.logTypes.CONFIG,
      repo: context.payload.repository.full_name,
      settings: JSON.stringify(config.settings)
    }

    log.info(JSON.stringify(configLog))
  }

  await processWorkflow(context, registry, config)
}

const logAndProcessConfigErrors = (context, config) => {
  const log = logger.create('flex')
  const event = `${context.event}.${context.payload.action}`
  const errors = config.errors

  let checks = new Checks()
  if (!checks.isEventSupported(event)) return

  let checkRunParam = {
    context: context,
    payload: {
      status: 'completed',
      conclusion: 'cancelled',
      output: {
        title: 'Invalid Configuration',
        summary: formatErrorSummary(errors)
      },
      completed_at: new Date()
    }
  }

  const configErrorLog = {
    log_type: logger.logTypes.CONFIG_INVALID_YML,
    errors,
    repo: context.payload.repository.full_name,
    event,
    settings: JSON.stringify(config.settings)
  }

  if (errors.has(Configuration.ERROR_CODES.NO_YML)) {
    checkRunParam.payload.conclusion = 'success'
    checkRunParam.payload.output = {
      title: 'No Config file found',
      summary: 'To enable Mergeable, please create a .github/mergeable.yml' +
        '\n\nSee the [documentation](https://github.com/mergeability/mergeable) for details on configuration.'
    }

    configErrorLog.log_type = logger.logTypes.CONFIG_NO_YML
  }

  log.info(JSON.stringify(configErrorLog))

  return checks.run(checkRunParam)
}

const formatErrorSummary = (errors) => {
  let it = errors.values()
  let summary = `Errors were found in the configuration (${Configuration.FILE_NAME}):`
  let message = it.next()
  while (!message.done) {
    summary += '\n- ' + message.value
    message = it.next()
  }
  summary += '\n\nSee the [documentation](https://github.com/mergeability/mergeable) for details on configuration.'
  return summary
}

const processWorkflow = async (context, registry, config) => {
  let log = logger.create('flex')
  // go through the settings and register all the validators
  try {
    Register.registerValidatorsAndActions(config.settings, registry)
  } catch (err) {
    let evt = `${context.event}.${context.payload.action}`
    let checks = new Checks()
    if (checks.isEventSupported(evt)) {
      checks.run({
        context: context,
        payload: {
          status: 'completed',
          conclusion: 'cancelled',
          output: {
            title: 'Invalid Validators or Actions',
            summary: `${err}`
          },
          completed_at: new Date()
        }
      })
    }
  }

  // do pre validation actions
  await processPreActions(context, registry, config)

  // process each rule found in configuration
  for (const rule of config.settings) {
    if (isEventInContext(rule.when, context)) {
      const result = await Promise.all(getValidatorPromises(context, registry, rule)).catch((err) => {
        const unknownErrorLog = {
          log_type: logger.logTypes.UNKNOWN_ERROR_VALIDATOR,
          errors: err.toString(),
          repo: context.payload.repository.full_name,
          event: `${context.event}.${context.payload.action}`,
          settings: JSON.stringify(config.settings)
        }
        log.error(unknownErrorLog)

        return Promise.resolve([consolidateResult(
          [
            constructErrorOutput(
              'An error occured',
              '',
              {},
              'Internal error!',
              'This is a mergeable bug, please report it on our issue tracker: https://github.com/mergeability/mergeable/issues/new\n\n' +
              '```\n' + (err.stack ? err.stack : err.toString()) + '\n```\n\n'
            )
          ],
          {name: 'Internal error'}
        )])
      })

      const translatedOutput = extractValidationStats(result)
      const promises = getActionPromises(context, registry, rule, translatedOutput)
      if (promises) {
        let errorOccurred = false

        const event = `${context.event}.${context.payload.action}`
        const comment = new Comment()

        await Promise.all(promises).catch((err) => {
          errorOccurred = true
          const payload = {
            body: '####  :x: Error Occurred while executing an Action \n\n ' +
            'If you believe this is an unexpected error, please report it on our issue tracker: https://github.com/mergeability/mergeable/issues/new \n' +
            '##### Error Details \n' +
            '-------------------- \n' +
            `${err.toString()}`
          }

          const unknownErrorLog = {
            log_type: logger.logTypes.UNKNOWN_ERROR_ACTION,
            errors: err.toString(),
            repo: context.payload.repository.full_name,
            event: `${context.event}.${context.payload.action}`,
            settings: JSON.stringify(config.settings)
          }
          log.error(unknownErrorLog)
          if (comment.isEventSupported(event)) {
            comment.handleError(context, payload)
          }
        })

        if (!errorOccurred && comment.isEventSupported(event)) await comment.removeErrorComments(context)
      }
    }
  }
}

const getValidatorPromises = (context, registry, rule) => {
  const validateFuncCall = (validator, context, validation) => validator.processValidate(context, validation, registry)

  return createPromises(rule.validate, 'validators', validateFuncCall, context, registry)
}

// call all action classes' beforeValidate, regardless of whether they are in failure or pass situation
const processPreActions = async (context, registry, config) => {
  let promises = []

  config.settings.forEach(rule => {
    if (isEventInContext(rule.when, context)) {
      // get actions within this rule
      const actions = extractAllActionFromRecipe(rule)
      // for each action, do the following
      actions.forEach(action => {
        if (registry.actions.get(action).isEventSupported(`${context.event}.${context.payload.action}`)) {
          promises.push(registry.actions.get(action).processBeforeValidate(context, rule, rule.name))
        }
      })
    }
  })

  await Promise.all(promises)
}

const extractAllActionFromRecipe = (recipe) => {
  let passActions = recipe.pass ? recipe.pass.map(action => action.do) : []
  let failActions = recipe.fail ? recipe.fail.map(action => action.do) : []
  let errorActions = recipe.error ? recipe.error.map(action => action.do) : []

  let action = _.union(passActions, failActions)
  action = _.union(action, errorActions)

  return action
}

const getActionPromises = (context, registry, rule, result) => {
  const actions = rule[result.validationStatus]
  if (actions) {
    const afterValidateFuncCall = (actionClass, context, action, name, result) => actionClass.processAfterValidate(context, action, name, result)

    return createPromises(actions, 'actions', afterValidateFuncCall, context, registry, rule.name, result)
  }
}

const isEventInContext = (event, context) => {
  let eventArray = event.split(', ')
  let contextEvent = `${context.event}.${context.payload.action}`
  let found = eventArray.find(element => {
    if (element.split('.')[1] === '*') {
      return element.split('.')[0] === context.event
    } else {
      return element === contextEvent
    }
  })

  return !!found
}

const createPromises = (arrayToIterate, registryName, funcCall, context, registry, name, result) => {
  let promises = []
  arrayToIterate.forEach(element => {
    let key = element.do

    let klass = registry[registryName].get(key)
    let eventName = `${context.event}.${context.payload.action}`
    if (klass.isEventSupported(eventName)) {
      promises.push(funcCall(klass, context, element, name, result))
    }
  })
  return promises
}

module.exports = executeMergeable
module.exports.getValidatorPromises = getValidatorPromises
