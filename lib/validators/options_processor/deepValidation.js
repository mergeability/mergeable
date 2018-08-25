const CLOSES_ISSUE_REGEX = new RegExp(`\\b(closes?|closed|fix|fixes?|fixed|resolves?|resolved)\\b.#[0-9]*`, 'ig')

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
      const issue = await getIssue(context, issues[i])
      if (issue.data[property]) {
        output.push(issue.data[property])
      }
    }
    return output
  }
}

const getIssue = async (context, issueNumber) => {
  return context.github.issues.get(context.repo({ number: issueNumber }))
}

module.exports = DeepValidation
