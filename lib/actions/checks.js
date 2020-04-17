const { Action } = require('./action')
const MetaData = require('../metaData')
const populateTemplate = require('./handlebars/populateTemplate')
const logger = require('../logger')
const _ = require('lodash')

const createChecks = async (context, payload) => {
  let params = _.cloneDeep(payload)
  params.name = 'Mergeable'

  // Note: octokit (wrapped by probot) requires head_branch.
  // Contradicting API docs that only requires head_sha
  // --> https://developer.github.com/v3/checks/runs/#create-a-check-run
  if (context.payload.checksuite) {
    params.head_branch = context.payload.checksuite.head_branch
    params.head_sha = context.payload.checksuite.head_sha
  } else {
    params.head_branch = context.payload.pull_request.head.ref
    params.head_sha = context.payload.pull_request.head.sha
  }

  let log = logger.create('action/checks')
  log.debug(`Creating Check for ${context.payload.repository.full_name} - status=${params.status}`)
  log.debug(params)
  return context.github.checks.create(context.repo(params))
}

const updateChecks = async (context, id, name, status, conclusion, output) => {
  if (!output) {
    output = {
      title: 'Test SUCCESS output',
      summary: 'Success summary'
    }
  }

  status = !status ? 'completed' : status
  conclusion = !conclusion ? 'success' : conclusion

  let log = logger.create('action/checks')
  let params = updateParams({context, name, status, output, id, conclusion})
  log.debug(`Updating Check for ${context.payload.repository.full_name} - status=${status}`)
  log.debug(params)
  await context.github.checks.update(params)
}

const updateParams = ({context, id, name, status, output, conclusion}) => {
  return context.repo({
    name: name,
    status: status,
    output: output,
    check_run_id: id,
    conclusion: conclusion,
    completed_at: new Date()
  })
}

class Checks extends Action {
  constructor () {
    super('checks')
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.synchronize'
    ]
  }

  async beforeValidate (context) {
    this.checkRunResult = await createChecks(context, {
      status: 'in_progress',
      output: {
        title: 'Mergeable is running.',
        summary: `Please be patient. We'll get you the results as soon as possible.`
      },
      started_at: new Date()
    })
  }

  populatePayloadWithResult (settings, results) {
    const output = {}
    Object.keys(settings).forEach(key => {
      output[key] = populateTemplate(settings[key], results)
    })

    return output
  }

  async run ({ context, settings, payload }) {
    await createChecks(context, payload)
  }

  async afterValidate (context, settings, results) {
    let payload = this.populatePayloadWithResult(settings.payload, results)

    if (payload.text !== undefined) {
      payload.text += MetaData.serialize({
        id: this.checkRunResult.data.id,
        event: context.event,
        action: context.payload.action
      })
    }

    await updateChecks(
      context,
      this.checkRunResult.data.id,
      'Mergeable',
      settings.state,
      settings.status,
      payload)
  }
}

module.exports = Checks
