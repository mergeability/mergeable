class Assignees {
  static async process (payload, context) {
    return payload.assignees.map(user => user.login)
  }
}

module.exports = Assignees
