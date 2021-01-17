const Interceptor = require('./interceptor')

/**
 * Handles milestoned and demilestoned for Pull Requests.
 */
class Milestoned extends Interceptor {
  async process (context) {
    if (this.valid(context)) {
      let res = await context.octokit.pulls.get(context.repo({pull_number: context.payload.issue.number}))
      res.data.action = context.payload.action
      context.eventName = 'pull_request'
      context.payload.pull_request = res.data
    }
    return context
  }

  /**
   * @return true if issue has the action milestoned or demilestoned but is from a pull_request.
   */
  valid (context) {
    // GH does not differentiate between issues and pulls for milestones. The only differentiator
    // is the payload for issues containing a pull_request property.
    return (context.eventName === 'issues' &&
      (context.payload.action === 'milestoned' ||
      context.payload.action === 'demilestoned')) &&
      !!context.payload.issue.pull_request
  }
}

module.exports = Milestoned
