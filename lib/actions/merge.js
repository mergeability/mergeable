const { Action } = require('./action')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')

const MERGE_METHOD_OPTIONS = ['merge', 'rebase', 'squash']

const mergePR = async (context, prNumber, mergeMethod, actionObj) => {
  const isMerged = await actionObj.githubAPI.checkIfMerged(context, prNumber)
  if (!isMerged) {
    const pullRequest = await context.octokit.pulls.get(context.repo({ pull_number: prNumber }))
    if (pullRequest.data.mergeable_state !== 'blocked' && pullRequest.data.state === 'open') {
      await actionObj.githubAPI.mergePR(context, context.repo({ pull_number: prNumber, merge_method: mergeMethod }))
    }
  }
}

class Merge extends Action {
  constructor () {
    super('merge')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'status.*',
      'check_suite.*'
    ]

    this.supportedSettings = {
      merge_method: 'string'
    }
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    if (settings.merge_method && !MERGE_METHOD_OPTIONS.includes(settings.merge_method)) {
      throw new UnSupportedSettingError(`Unknown Merge method, supported options are ${MERGE_METHOD_OPTIONS.join(', ')}`)
    }
    const mergeMethod = settings.merge_method ? settings.merge_method : 'merge'
    let relatedPullRequests = []
    if (context.eventName === 'status') {
      const commitSHA = context.payload.sha
      const results = await this.githubAPI.searchIssuesAndPR(context, {
        q: `repo:${context.repo().owner}/${context.repo().repo} is:open ${commitSHA}`.trim(),
        sort: 'updated',
        order: 'desc',
        per_page: 20
      })
      relatedPullRequests = results.filter(item => item.pull_request)
    } else if (context.eventName === 'check_suite') {
      relatedPullRequests = this.getPayload(context).pull_requests
    } else {
      relatedPullRequests = [this.getPayload(context)]
    }
    return Promise.all(
      // eslint-disable-next-line array-callback-return
      relatedPullRequests.map(issue => {
        mergePR(
          context,
          issue.number,
          mergeMethod,
          this
        )
      })
    )
  }
}

module.exports = Merge
