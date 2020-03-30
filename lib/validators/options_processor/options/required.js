const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array of string as input`

class Required {
  static process (validatorContext, input, rule) {
    const filter = rule.required

    const reviewers = filter['reviewers'] ? filter['reviewers'] : []
    const owners = filter['owners'] ? filter['owners'] : []
    const assignees = filter['assignees'] ? filter['assignees'] : []
    const requestedReviewers = filter['requested_reviewers'] ? filter['requested_reviewers'] : []
    let description = filter['message']

    if (!Array.isArray(input)) {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    // go thru the required list and check against inputs
    let remainingRequired = new Map(reviewers.map(user => [user.toLowerCase(), user]))
    input.forEach(user => remainingRequired.delete(user.toLowerCase()))

    const isMergeable = remainingRequired.size === 0

    const requiredReviewers = Array.from(remainingRequired.values()).map(user => {
      if (owners.includes(user)) {
        return user + '(Code Owner) '
      }
      if (assignees.includes(user)) {
        return user + '(Assignee) '
      }
      if (requestedReviewers.includes(user)) {
        return user + '(Requested Reviewer) '
      }

      return user + ' '
    })

    const DEFAULT_SUCCESS_MESSAGE = `${validatorContext.name}: all required reviewers have approved`
    if (!description) description = `${validatorContext.name}: ${requiredReviewers}required`

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

module.exports = Required
