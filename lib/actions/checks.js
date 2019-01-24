const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')

const createChecks = async (context, name, status, output) => {
  let headBranch
  let headSha

  if (!output) {
    output = {
      title: 'Mergeable Tests running',
      summary: `Please be patient, we'll get you the result as soon as possible`
    }
  }

  if (context.payload.checksuite) {
    // being called by check_run
    headBranch = context.payload.checksuite.head_branch
    headSha = context.payload.checksuite.head_sha
  } else {
    headBranch = context.payload.pull_request.head.ref
    headSha = context.payload.pull_request.head.sha
  }
  status = !status ? 'in_progress' : status

  let log = context.log.child({name: 'mergeable'})
  let params = createParams({context, headBranch, headSha, name, status, output})
  log.debug(`Creating Check for ${context.payload.repository.full_name} - status=${status}`)
  log.debug(params)
  return context.github.checks.create(params)
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

  let log = context.log.child({name: 'mergeable'})
  let params = updateParams({context, name, status, output, id, conclusion})
  log.debug(`Updating Check for ${context.payload.repository.full_name} - status=${status}`)
  log.debug(params)
  await context.github.checks.update(params)
}

const createParams = ({context, headBranch, headSha, name, status, output}) => {
  return context.repo({
    name: name,
    status: status,
    output: output,
    head_branch: headBranch,
    head_sha: headSha,
    started_at: new Date()
  })
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
    super()
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

  async beforeValidate ({context}) {
    this.checkRunResult = await createChecks(context, 'Mergeable')
  }

  populatePayloadWithResult (settings, results) {
    const output = {}
    Object.keys(settings).forEach(key => {
      output[key] = populateTemplate(settings[key], results)
    })

    return output
  }

  async afterValidate (context, settings, results) {
    const payload = this.populatePayloadWithResult(settings.payload, results)

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
