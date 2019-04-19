/**
 * The Mergeable context is a wrapper and extension of the probot context with some convenience
 * methods (in the future).
 */
class Context {
  constructor (context) {
    this.probotContext = context
    this.event = context.event
    this.payload = context.payload
    this.github = context.github
    this.log = context.log
  }

  repo (obj) {
    return this.probotContext.repo(obj)
  }
}

module.exports = Context
