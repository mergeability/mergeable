// @deprecated
const CLOSES_ISSUE_REGEX = new RegExp(`\\b(closes?|closed|fix|fixes?|fixed|resolves?|resolved)\\b.#[0-9]*`, 'ig')

const checkIfClosesAnIssue = (description) => {
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

const checkIfIssueHaveProperty = async (context, issues, property, match) => {
  const regex = new RegExp(match, 'i')
  for (let i = 0; i < issues.length; i++) {
    const issue = await getIssue(context, issues[i])
    const prop = issue.data[property]

    if (prop && regex.test(prop.title)) {
      return true
    }
  }

  return false
}

const getIssue = async (context, issueNumber) => {
  return context.github.issues.get(context.repo({ number: issueNumber }))
}

module.exports = {
  checkIfClosesAnIssue,
  checkIfIssueHaveProperty
}
