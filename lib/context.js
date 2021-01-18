/**
 * The Mergeable context is a wrapper and extension of the probot context with some convenience
 * methods (in the future).
 */
class Context {
  constructor (context) {
    this.probotContext = context
    this.eventId = context.id
    this.eventName = context.name
    this.payload = context.payload
    this.octokit = context.octokit
    this.log = context.log
  }

  getEvent () {
    return (this.payload && this.payload.action) ? `${this.eventName}.${this.payload.action}` : this.eventName
  }

  repo (obj) {
    return this.probotContext.repo(obj)
  }
}

module.exports = Context
