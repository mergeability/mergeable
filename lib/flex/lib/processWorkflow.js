const getValidatorPromises = require('./getValidatorPromises')
const getActionPromises = require('./getActionPromises')
const consolidateResult = require('../../validators/options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('../../validators/options_processor/options/lib/constructErrorOutput')
const Register = require('../../register')
const extractValidationStats = require('../../stats/extractValidationStats')
const Checks = require('../../actions/checks')

const logger = require('../../logger')

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
        await Promise.all(promises).catch((err) => {
          const unknownErrorLog = {
            log_type: logger.logTypes.UNKNOWN_ERROR_ACTION,
            errors: err.toString(),
            repo: context.payload.repository.full_name,
            event: `${context.event}.${context.payload.action}`,
            settings: JSON.stringify(config.settings)
          }
          log.error(unknownErrorLog)
        })
      }
    }
  }
}

// call all action classes' beforeValidate, regardless of whether they are in failure or pass situation
const processPreActions = async (context, registry, config) => {
  let promises = []

  config.settings.forEach(rule => {
    if (isEventInContext(rule.when, context)) {
      registry.actions.forEach(action => {
        if (action.isEventSupported(`${context.event}.${context.payload.action}`)) {
          promises.push(action.processBeforeValidate(context, rule, rule.name))
        }
      })
    }
  })

  await Promise.all(promises)
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

module.exports = processWorkflow
