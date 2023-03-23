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
        enabled: 'boolean',
        message: 'string'
      },
      must_include: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string',
        all: 'boolean'
      },
      must_exclude: {
        regex: ['string', 'array'],
        regex_flag: 'string',
        message: 'string',
        all: 'boolean'
      },
      begins_with: {
        match: ['string', 'array'],
        message: 'string'
      },
      ends_with: {
        match: ['string', 'array'],
        message: 'string'
      },
      min: {
        count: 'number',
        message: 'string'
      },
      max: {
        count: 'number',
        message: 'string'
      },
      files: {
        added: 'boolean',
        modified: 'boolean',
        removed: 'boolean'
      }
    }
  }

  async validate (context, validationSettings) {
    // fetch the file list
    let result = await this.githubAPI.listFiles(context, context.repo({ pull_number: this.getPayload(context).number }))

    if (validationSettings.files) {
      const fileStatusOptions = Object.keys(validationSettings.files).filter(fileStatus => validationSettings.files[fileStatus])
      result = result.filter(file => fileStatusOptions.includes(file.status))
      delete validationSettings.files
    }

    const changedFiles = result.map(file => file.filename)

    return this.processOptions(validationSettings, changedFiles)
  }
}

module.exports = Changeset
