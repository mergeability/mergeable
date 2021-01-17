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
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
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
      }
    }
  }

  async validate (context, validationSettings) {
    // fetch the file list
    let result = await context.octokit.paginate(
      context.octokit.pulls.listFiles.endpoint.merge(
        context.repo({ pull_number: this.getPayload(context).number })
      ),
      res => res.data
    )

    let changedFiles = result.map(file => file.filename)

    return this.processOptions(validationSettings, changedFiles)
  }
}

module.exports = Changeset
