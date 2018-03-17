const Approvals = require('./lib/approvals')
module.exports = (robot) => {
  robot.log('')
  robot.on(
    ['pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed'],
    handle
  )

  async function handle (context) {
    let approvals = new Approvals(2)
    let mergeable = await approvals.isMergeable(context)
    let status = mergeable ? 'success' : 'failure'

    context.github.repos.createStatus(context.repo({
      sha: context.payload.pull_request.head.sha,
      state: status,
      target_url: 'https://github.com/apps/mergeable',
      description: mergeable ? 'ready for review' : approvals.description(),
      context: 'Mergeable'
    }))
    console.log(mergeable)
  }
}
