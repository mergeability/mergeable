const { Action } = require('./action')
const MetaData = require('../metaData')
const populateTemplate = require('./handlebars/populateTemplate')
const logger = require('../logger')
const _ = require('lodash')
const createCheckName = require('./lib/createCheckName')

const createChecks = async (context, payload, actionObj) => {
  const params = _.cloneDeep(payload)
  params.name = createCheckName(params.name)

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

  const log = logger.create('action/checks')
  log.debug(`Creating Check for ${context.payload.repository.full_name} - status=${params.status}`)
  log.debug(params)
  return actionObj.githubAPI.createChecks(context, context.repo(params))
}

const updateChecks = async (context, id, name, status, conclusion, output, actionObj) => {
  if (!output) {
    output = {
      title: 'Test SUCCESS output',
      summary: 'Success summary'
    }
  }

  status = !status ? 'completed' : status
  conclusion = !conclusion ? 'success' : conclusion

  const log = logger.create('action/checks')
  const params = updateParams({ context, name, status, output, id, conclusion })
  log.debug(`Updating Check for ${context.payload.repository.full_name} - status=${status}`)
  log.debug(params)
  await actionObj.githubAPI.updateChecks(context, params)
}

const updateParams = ({ context, id, name, status, output, conclusion }) => {
  const check = {
    name: name,
    status: status,
    output: output,
    check_run_id: id
  }

  if (status === 'completed') {
    check.conclusion = conclusion
    check.completed_at = new Date()
  }

  return context.repo(check)
}

class Checks extends Action {
  constructor () {
    super('checks')

    // Support for 'pull_request.closed' event was not enabled since
    // it does not have meaningful use in the context of GitHub
    // check API: there is no reason to post a check result on a
    // pull request that is actually closed.
    this.supportedEvents = [
      'pull_request.assigned',
      'pull_request.auto_merge_disabled',
      'pull_request.auto_merge_enabled',
      'pull_request.converted_to_draft',
      'pull_request.demilestoned',
      'pull_request.dequeued',
      'pull_request.edited',
      'pull_request.enqueued',
      'pull_request.labeled',
      'pull_request.locked',
      'pull_request.milestoned',
      'pull_request.opened',
      'pull_request.push_synchronize',
      'pull_request.ready_for_review',
      'pull_request.reopened',
      'pull_request.review_request_removed',
      'pull_request.review_requested',
      'pull_request.synchronize',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.unlocked',
      'pull_request_review.dismissed',
      'pull_request_review.edited',
      'pull_request_review.submitted'
    ]
    this.checkRunResult = new Map()
  }

  async beforeValidate (context, settings, name) {
    const result = await createChecks(context, {
      status: 'in_progress',
      output: {
        title: 'Mergeable is running.',
        summary: 'Please be patient. We\'ll get you the results as soon as possible.'
      },
      name: name,
      started_at: new Date()
    }, this)

    this.checkRunResult.set(name, result)
  }

  populatePayloadWithResult (settings, results, context) {
    const output = {}
    Object.keys(settings).forEach(key => {
      output[key] = populateTemplate(settings[key], results, this.getPayload(context))
    })

    return output
  }

  async run ({ context, settings, payload }) {
    await createChecks(context, payload, this)
  }

  async afterValidate (context, settings, name, results) {
    const checkRunResult = this.checkRunResult.get(name)

    const payload = this.populatePayloadWithResult(settings.payload, results, context)

    if (payload.text !== undefined) {
      payload.text += MetaData.serialize({
        id: checkRunResult.data.id,
        eventName: context.eventName,
        action: context.payload.action
      })
    }

    await updateChecks(
      context,
      checkRunResult.data.id,
      createCheckName(name),
      settings.state,
      settings.status,
      payload,
      this)
  }
}

module.exports = Checks
