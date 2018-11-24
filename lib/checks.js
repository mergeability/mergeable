// @deprecated
const create = async (context, name, status, output) => {
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

  return context.github.checks.create(
    createParams({context, headBranch, headSha, name, status, output})
  )
}

const update = async (context, id, name, status, conclusion, output) => {
  if (!output) {
    output = {
      title: 'Test SUCCESS output',
      summary: 'Success summary'
    }
  }

  status = !status ? 'completed' : status

  conclusion = !conclusion ? 'success' : conclusion

  await context.github.checks.update(
    updateParams({context, name, status, output, id, conclusion})
  )
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

module.exports = {
  create,
  update
}
