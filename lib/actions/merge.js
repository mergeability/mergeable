const { Action } = require('./action')
const UnSupportedSettingError = require('../errors/unSupportedSettingError')
const handlebars = require('handlebars')

const MERGE_METHOD_OPTIONS = ['merge', 'rebase', 'squash']

const mergePR = async (context, prNumber, mergeMethod, commitTitle, commitMessage, actionObj) => {
  const isMerged = await actionObj.githubAPI.checkIfMerged(context, prNumber)
  if (!isMerged) {
    const pullRequest = await actionObj.githubAPI.getPR(context, prNumber)

    if (pullRequest.data.mergeable_state !== 'blocked' && pullRequest.data.state === 'open') {
      const mergeParams = { pull_number: prNumber, merge_method: mergeMethod }
      if (commitTitle !== undefined) {
        const template = handlebars.compile(commitTitle)
        mergeParams.commit_title = template(pullRequest.data)
      }
      if (commitMessage !== undefined) {
        const template = handlebars.compile(commitMessage)
        mergeParams.commit_message = template(pullRequest.data)
      }
      await actionObj.githubAPI.mergePR(context, context.repo(mergeParams))
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
      'check_suite.*',
      'issue_comment.*'
    ]

    this.supportedSettings = {
      merge_method: 'string'
    }
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    if (context.eventName === 'issue_comment' && !context.payload.issue?.pull_request) {
      return Promise.resolve()
    }
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
          settings.commit_title,
          settings.commit_message,
          this
        )
      })
    )
  }
}

module.exports = Merge
