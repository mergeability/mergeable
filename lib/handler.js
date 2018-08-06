const Configuration = require('../lib/configuration')
const fetch = require('node-fetch')
const checks = require('../lib/checks')
const stale = require('../lib/stale')
const { isEventInContext } = require('../lib/validators/validator')

class Handler {
  static async handleIssues (context) {
    if (context.payload.issue.pull_request) {
      let res = await fetch(context.payload.issue.pull_request.url)
      let pr = await res.json()
      context.payload.pull_request = pr
      return this.handle(context, pr)
    }
  }

  static async handleIssuesOpened (context) {
    var config = await Configuration.instanceWithContext(context)
    let issue = context.payload.issue
    let settings = config.settings.mergeable.issues || {}
    let validators = []
    let excludes = (settings.exclude)
      ? settings.exclude.split(',').map(val => val.trim()) : []
    let includes = [ 'title', 'label', 'milestone', 'description', 'projects', 'assignee' ]
      .filter(validator => excludes.indexOf(validator) === -1)

    includes.forEach(validator => {
      validators.push(require(`../lib/${validator}`)(issue, context, settings))
    })

    console.info(config)
    return Promise.all(validators).then(results => {
      let failures = results.filter(validated => !validated.mergeable)

      if (failures.length !== 0) {
        let description = `## Mergeable has found some problems`
        for (let validated of failures) {
          description += `\n - ${validated.description}`
        }
        description += `\n ___ \n **Please address these problems to adhere to the repo's guidelines. Thank you!**`
        context.github.issues.createComment(
          context.repo({ number: issue.number, body: description })
        )
      }
    }).catch(error => {
      // (jusx) This should never ever happen. Log it.
      console.error(error)
    })
  }

  /**
   * Handler for processing stale issues and/or pulls. Only call stale validations
   * when there is configuration for either pulls or issues.
   */
  static async handleStale (context) {
    let config = await Configuration.instanceWithContext(context)
    let pullsConf = config.settings.mergeable.pull_requests
    let issuesConf = config.settings.mergeable.issues
    let isStaleConfig = (issuesConf && issuesConf.stale && issuesConf.stale.days) ||
      (pullsConf && pullsConf.stale && pullsConf.stale.days)

    if (isStaleConfig) return stale(context, config)
  }

  static async handlePullRequest (context) {
    return this.handle(context, context.payload.pull_request)
  }

  static async handleChecks (context) {
    // @TODO handle checks rerun calls
  }

  static async handle (context, pullRequest) {
    const checkRunResult = await checks.create(context, 'Mergeable')
    // let the user know that we are validating if PR is mergeable
    let config
    try {
      config = await Configuration.instanceWithContext(context)
    } catch (err) {
      checks.update(
        context,
        checkRunResult.data.id,
        'Mergeable',
        'completed',
        'action_required',
        {
          title: `An Error has occured, Please resolve them for mergeable to run properly`,
          summary: `Following Error has been reported from Mergeable:\n` + err.toString()})
    }

    let settings = config.settings.mergeable.pull_requests || config.settings.mergeable
    let validators = []
    let excludes = (settings.exclude)
      ? settings.exclude.split(',').map(val => val.trim()) : []
    let includes = [ 'approvals', 'title', 'label', 'milestone', 'description', 'projects', 'assignee', 'dependent' ]
      .filter(validator => excludes.indexOf(validator) === -1)

    includes.forEach(validator => {
      validators.push(require(`../lib/${validator}`)(pullRequest, context, settings))
    })
    console.info(config)
    return Promise.all(validators).then(results => {
      let failures = results.filter(validated => !validated.mergeable)

      let status, description
      if (failures.length === 0) {
        status = 'success'
        description = 'Okay to merge.'
      } else {
        status = 'failure'
        description = `## Mergeable has found the following failed checks`
        for (let validated of failures) {
          description += `\n - ${validated.description}`
        }
        description += `\n ___ \n **Please address the problems found above!**`
      }

      checks.update(
        context,
        checkRunResult.data.id,
        'Mergeable',
        'completed',
        status,
        {
          title: `Result: ${status}`,
          summary: description})

      console.info({state: status, description: description})
    }).catch(err => {
      console.error(err)

      checks.update(
        context,
        checkRunResult.data.id,
        'Mergeable',
        'completed',
        'action_required',
        {
          title: `An Error has occured, Please resolve them for mergeable to run properly`,
          summary: `Following Error has been reported from Mergeable:\n` + err.toString()})
    })
  }

  // TODO Refactor this since it's responsibility goes beyond handling validators and actions.
  // For now, a quick and easy way to have testable units through simple dependency injection.
  static async handleFlex(context, registry) {
    // TODO if PR do checks and verify.
    let config = await Configuration.instanceWithContext(context)

    // Quick and dirty for now. Registry should be as a singleton that caches instances
    // of validators and actions - @jusx
    if (registry === undefined) {
      registry = { validators: new Map(), actions: new Map() }
    }

    context.log.debug('Processing: \n' + config.settings)
    config.settings.mergeable.forEach((rule)=> {
      let events = Array.isArray(rule.when)? rule.when : rule.when.split(',').map(n=>n.trim())
      let executable

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
        .then( results => {
          context.log.debug(results)
          // TODO call actions.
        })
        .catch(e => {
          context.log.error(e)
        })
    })
  }
}

module.exports = Handler
