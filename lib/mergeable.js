const createScheduler = require('probot-scheduler')
const Handler = require('./handler')
const Configuration = require('../lib/configuration')
const { isEventInContext } = require('./eventAware')

class Mergeable {
  constructor (mode, version) {
    this.mode = mode
    this.version = version
  }

  start (robot) {
    if (this.mode === 'development') {
      robot.log.info('In DEVELOPMENT mode.')
      robot.log.info('Starting scheduler at 2 second intervals.')
      this.schedule(robot, { interval: 60 * 60 * 2 })
    } else {
      robot.log.info('In PRODUCTION mode.')
      robot.log.info('Starting scheduler at 1 hour intervals')
      this.schedule(robot, { interval: 60 * 60 * 1000 })
    }

    (this.version === 'flex') ? this.flex(robot) : this.genesis(robot)
  }

  schedule (robot, options) {
    createScheduler(robot, options)
  }

  // version 2 of mergeable WIP as we refactor the code base.
  flex (robot) {
    robot.on('*', async context => {
      context.log.info({event: context.event, action: context.payload.action})
      processValidations(context)
    })
  }

  genesis (robot) {
    robot.on(
      [ 'pull_request.opened',
        'pull_request.edited',
        'pull_request_review.submitted',
        'pull_request_review.edited',
        'pull_request_review.dismissed',
        'pull_request.labeled',
        'pull_request.unlabeled',
        'pull_request.synchronize'
      ],
      context => Handler.handlePullRequest(context)
    )

    robot.on(['issues.milestoned', 'issues.demilestoned'],
      context => Handler.handleIssues(context)
    )

    robot.on(['issues.opened'],
      (context) => { Handler.handleIssuesOpened(context) }
    )

    robot.on('schedule.repository',
      context => Handler.handleStale(context)
    )
  }
}

// TODO Refactor this since it's responsibility goes beyond handling validators and actions.
// For now, a quick and easy way to have testable units through simple dependency injection.
const processValidations = async (context, registry) => {
  // TODO if PR do checks and verify.
  let config = await Configuration.instanceWithContext(context)

  // Quick and dirty for now. Registry should be as a singleton that caches instances
  // of validators and actions - @jusx
  if (registry === undefined) {
    registry = { validators: new Map(), actions: new Map() }
  }

  context.log.debug('Processing: \n' + config.settings)
  config.settings.mergeable.forEach((rule) => {
    let events = Array.isArray(rule.when) ? rule.when : rule.when.split(',').map(n => n.trim())

    let promisses = []
    rule.validate.forEach(validation => {
      let key = validation.do
      if (!registry.validators.has(key)) {
        let Validator = require(`./validators/${key}`)
        registry.validators.set(key, new Validator())
      }

      let validator = registry.validators.get(key)
      let eventName = `${context.event}.${context.payload.action}`
      if (isEventInContext(eventName, events) && validator.isEventSupported(eventName)) {
        promisses.push(validator.validate(context, validation, config.settings))
      }
    })

    Promise.all(promisses)
      .then(results => {
        context.log.debug(results)
        // TODO call actions for pass or fail
      })
      .catch(e => {
        context.log.error(e)
        // TODO call actions for error.
      })
  })
}

module.exports = { Mergeable: Mergeable, processValidations: processValidations }
