const logger = require('../logger')
const TeamNotFoundError = require('../errors/teamNotFoundError')

const createLog = (context, option) => {
  return Object.assign({
    logType: logger.logTypes.UNKNOWN_GITHUB_API_ERROR,
    eventId: context.eventId,
    repo: context.payload.repository.full_name,
    event: `${context.eventName}.${context.payload.action}`
  }, option)
}

const checkCommonError = (err, context, callFn) => {
  const log = logger.create(`GithubAPI/${callFn}`)

  const errorLog = createLog(context, { callFn: callFn, errors: err.toString() })

  switch (err.status) {
    case 500:
      errorLog.logType = logger.logTypes.GITHUB_SERVER_ERROR
      break
    case 404:
      errorLog.logType = logger.logTypes.HTTP_NOT_FOUND_ERROR
      break
    default:
  }
  log.error(errorLog)
  throw err // bubble up the error so that the flow will break, unless it is need
}

const debugLog = (context, callFn) => {
  const log = logger.create(`GithubAPI/${callFn}`)
  const debugLog = createLog(context, { callFn, logType: logger.logTypes.GITHUB_API_DEBUG })
  log.debug(JSON.stringify(debugLog))
}

class GithubAPI {
  static async listFiles (context, callParams) {
    const callFn = 'pulls.listFiles'
    debugLog(context, callFn)

    return context.octokit.paginate(
      context.octokit.pulls.listFiles.endpoint.merge(
        callParams
      ),
      res => res.data
    ).catch((err) => {
      return checkCommonError(err, context, callFn)
    })
  }

  static async addAssignees (context, issueNumber, assignees) {
    const callFn = 'issues.addAssignees'

    debugLog(context, callFn)

    try {
      return context.octokit.issues.addAssignees(
        context.repo({ issue_number: issueNumber, assignees })
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async checkUserCanBeAssigned (context, issueNumber, assignee) {
    const callFn = 'issues.checkUserCanBeAssigned'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.issues.checkUserCanBeAssigned(
        context.repo({ issue_number: issueNumber, assignee })
      )

      return res.status === 204 ? assignee : null
    } catch (err) {
      if (err.status === 404) return null
      return checkCommonError(err, context, callFn)
    }
  }

  static async createChecks (context, callParams) {
    const callFn = 'checks.create'
    debugLog(context, callFn)

    try {
      return await context.octokit.checks.create(context.repo(callParams))
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async updateChecks (context, callParams) {
    const callFn = 'checks.update'

    debugLog(context, callFn)

    try {
      return await context.octokit.checks.update(callParams)
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async getContent (context, callParam) {
    const callFn = 'repos.getContent'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.repos.getContent(callParam)
      return Buffer.from(res.data.content, 'base64').toString()
    } catch (err) {
      if (err.status === 404) return null
      return checkCommonError(err, context, callFn)
    }
  }

  static async listLabelsOnIssue (context, issueNumber) {
    const callFn = 'issues.listLabelsOnIssue'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.issues.listLabelsOnIssue(
        context.repo({ issue_number: issueNumber })
      )
      return res.data.map(label => label.name)
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async addLabels (context, issueNumber, labels) {
    const callFn = 'issues.addLabels'

    debugLog(context, callFn)

    try {
      return await context.octokit.issues.addLabels(
        context.repo({ issue_number: issueNumber, labels: labels })
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async setLabels (context, issueNumber, labels) {
    const callFn = 'issues.setLabels'

    debugLog(context, callFn)

    try {
      return await context.octokit.issues.setLabels(
        context.repo({ issue_number: issueNumber, labels: labels })
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async createComment (context, issueNumber, body) {
    const callFn = 'issues.createComment'

    debugLog(context, callFn)

    try {
      return await context.octokit.issues.createComment(
        context.repo({ issue_number: issueNumber, body })
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async listComments (context, issueNumber) {
    const callFn = 'issues.listComments'

    debugLog(context, callFn)

    try {
      return await context.octokit.paginate(
        context.octokit.issues.listComments.endpoint.merge(
          context.repo({ issue_number: issueNumber })
        ),
        res => res.data
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async deleteComment (context, commentId) {
    const callFn = 'issues.deleteComment'

    debugLog(context, callFn)

    try {
      return await context.octokit.issues.deleteComment(
        context.repo({ comment_id: commentId }))
    } catch (err) {
      if (err.status === 404) {
        return null
      }
      return checkCommonError(err, context, callFn)
    }
  }

  static async getIssues (context, issueNumber) {
    const callFn = 'issues.get'

    debugLog(context, callFn)

    try {
      return await context.octokit.issues.get(context.repo({ issue_number: issueNumber }))
    } catch (err) {
      // if Error is 404, simply skip
      if (err.status === 404) return
      return checkCommonError(err, context, callFn)
    }
  }

  static async updateIssues (context, issueNumber, state) {
    const callFn = 'issues.update'

    debugLog(context, callFn)

    try {
      return context.octokit.issues.update(
        context.repo({ issue_number: issueNumber, state })
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async listMembersInOrg (context, org, teamSlug) {
    const callFn = 'teams.listMembersInOrg'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.teams.listMembersInOrg({
        org,
        team_slug: teamSlug
      })

      return res.data.map(member => member.login)
    } catch (err) {
      if (err.status === 404) {
        throw new TeamNotFoundError(`${org}/${teamSlug}`)
      }
      return checkCommonError(err, context, callFn)
    }
  }

  static async getMembershipForUserInOrg (context, org, teamSlug, username) {
    const callFn = 'teams.getMembershipForUserInOrg'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.teams.getMembershipForUserInOrg({
        org,
        team_slug: teamSlug,
        username: username
      })
      return (res.data.state === 'active')
    } catch (err) {
      if (err.status === 404) {
        return false
      } else {
        throw err
      }
    }
  }

  static async projectListColumns (context, callParam) {
    const callFn = 'projects.listColumns'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.projects.listColumns(callParam)

      return res.data.map(project => project.id)
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async projectListForRepo (context, callParam) {
    const callFn = 'projects.listForRepo'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.projects.listForRepo(callParam)

      return res.data.map(project => ({ id: project.id, name: project.name }))
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async projectListCards (context, callParam) {
    const callFn = 'projects.listCards'

    debugLog(context, callFn)

    try {
      return await context.octokit.projects.listCards(callParam)
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async searchIssuesAndPR (context, callParam) {
    const callFn = 'search.issuesAndPullRequests'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.search.issuesAndPullRequests(callParam)

      return res.data.items
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async listCollaborators (context, callParam) {
    const callFn = 'repos.listCollaborators'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.repos.listCollaborators(
        callParam
      )

      return res.data.map(user => user.login)
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async getAllTopics (context, callParam) {
    const callFn = 'repos.getAllTopics'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.repos.getAllTopics(callParam)

      return res.data.names
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async compareCommits (context, callParam) {
    const callFn = 'repos.compareCommits'

    debugLog(context, callFn)

    try {
      const res = await context.octokit.repos.compareCommits(callParam)

      return res.data
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async mergePR (context, callParams) {
    const callFn = 'pulls.merge'
    debugLog(context, callFn)

    try {
      return await context.octokit.pulls.merge(callParams)
    } catch (err) {
      // skip on known errors
      // 405 === Method not allowed , 409 === Conflict
      if (err.status === 405 || err.status === 409) {
        // if the error is another required status check, just skip
        // no easy way to check if all required status are done
        if (err.message.toLowerCase().includes('required status check')) return

        const errorLog = createLog(context, { callFn: callFn, errors: err.toString(), logType: logger.logTypes.MERGE_FAIL_ERROR })

        const log = logger.create(`GithubAPI/${callFn}`)
        log.info(JSON.stringify(errorLog))
      }

      return checkCommonError(err, context, callFn)
    }
  }

  static async checkIfMerged (context, pullNumber) {
    const callFn = 'pulls.checkIfMerged'

    debugLog(context, callFn)

    try {
      await context.octokit.pulls.checkIfMerged(context.repo({ pull_number: pullNumber }))
      // if the above doesn't throw error just return true
      return true
    } catch (err) {
      if (err.status === 404) {
        return false
      } else {
        return checkCommonError(err, context, callFn)
      }
    }
  }

  static async getPR (context, pullNumber) {
    const callFn = 'pulls.get'

    debugLog(context, callFn)

    try {
      return context.octokit.pulls.get(context.repo({ pull_number: pullNumber }))
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async requestReviewers (context, pullNumber, reviewers, teamReviewers) {
    const callFn = 'pulls.requestReview'

    debugLog(context, callFn)
    try {
      return await context.octokit.pulls.requestReviewers(
        context.repo({ pull_number: pullNumber, reviewers, team_reviewers: teamReviewers })
      )
    } catch (err) {
      const errorLog = createLog(context, { callFn: callFn, errors: err.toString(), logType: logger.logTypes.REQUEST_REVIEW_FAIL_ERROR })
      const log = logger.create(`GithubAPI/${callFn}`)

      log.info(errorLog)
    }
  }

  static async listPR (context) {
    const callFn = 'pulls.list'

    debugLog(context, callFn)

    try {
      return await context.octokit.pulls.list(context.repo({
        base: context.payload.ref
      }))
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async listReviews (context, pullNumber) {
    const callFn = 'pulls.listReviews'

    debugLog(context, callFn)

    try {
      return await context.octokit.paginate(
        context.octokit.pulls.listReviews.endpoint.merge(
          context.repo({ pull_number: pullNumber })
        ),
        res => res.data
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }

  static async listCommits (context, pullNumber) {
    const callFn = 'pulls.listCommits'

    debugLog(context, callFn)

    try {
      return await context.octokit.paginate(
        context.octokit.pulls.listCommits.endpoint.merge(
          context.repo({ pull_number: pullNumber })
        ),
        res => res.data.map(o => ({ message: o.commit.message, date: o.commit.author.date, author: o.commit.author, committer: o.commit.committer }))
      )
    } catch (err) {
      return checkCommonError(err, context, callFn)
    }
  }
}

module.exports = GithubAPI
