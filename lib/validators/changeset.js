const { Validator } = require('./validator')

class Changeset extends Validator {
  constructor () {
    super('changeset')
    this.supportedEvents = [
      'pull_request.*'
    ]
  }

  async validate (context, validationSettings) {
    // fetch the file list
    let result = await context.github.pulls.listFiles(context.repo({pull_number: this.getPayload(context).number}))
    let changedFiles = result.data.map(file => file.filename)

    return this.processOptions(validationSettings, changedFiles)
  }
}

module.exports = Changeset
