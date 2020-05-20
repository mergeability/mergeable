class TeamNotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'TeamNotFoundError'
  }
}

module.exports = TeamNotFoundError
