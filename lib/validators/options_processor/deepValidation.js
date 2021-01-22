const CLOSES_ISSUE_REGEX = new RegExp(`\\b(closes?|closed|fix|fixes?|fixed|resolves?|resolved)\\b.#[0-9]*`, 'ig')
const logger = require('../../logger')

class DeepValidation {
  static checkIfClosesAnIssue (description) {
    let res
    let issues = []

    do {
      res = CLOSES_ISSUE_REGEX.exec(description)
      if (res) {
        const match = res[0].indexOf('#')
        issues.push(res[0].substr(match + 1))
      }
    } while (res)
    return issues
  }

  static async checkIfIssueHaveProperty (context, issues, property) {
    const output = []
    for (let i = 0; i < issues.length; i++) {
      let issue
      try {
        issue = await getIssue(context, issues[i])
      } catch (err) {
        // simply skip if the error is 404 (Not Found)
        if (err.status !== 404) {
          const errorLog = {
            log_type: logger.logTypes.ISSUE_GET_FAIL_ERROR,
            event_id: context.eventId,
            repo: context.payload.repository.full_name,
            validator_name: property
          }

          this.log.error(JSON.stringify(errorLog))
        }
        continue
      }
      if (issue.data[property]) {
        output.push(issue.data[property])
      }
    }
    return output
  }
}

const getIssue = async (context, issueNumber) => {
  return context.octokit.issues.get(context.repo({ issue_number: issueNumber }))
}

module.exports = DeepValidation
