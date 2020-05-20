const { Validator } = require('./validator')

class Changeset extends Validator {
  constructor () {
    super('changeset')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      no_empty: {
        enabled: Boolean,
        message: String
      },
      must_include: {
        regex: String,
        message: String
      },
      must_exclude: {
        regex: String,
        message: String
      },
      begins_with: {
        regex: String,
        message: String
      },
      ends_with: {
        regex: String,
        message: String
      },
      min: {
        count: Number,
        message: String
      },
      max: {
        count: Number,
        message: String
      }
    }
  }

  async validate (context, validationSettings) {
    // fetch the file list
    let result = await context.github.pulls.listFiles(context.repo({pull_number: this.getPayload(context).number}))
    let changedFiles = result.data.map(file => file.filename)

    return this.processOptions(validationSettings, changedFiles)
  }
}

module.exports = Changeset
