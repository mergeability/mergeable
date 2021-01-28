const { Filter } = require('./filter')

class Repository extends Filter {
  constructor () {
    super('repository')
    this.supportedEvents = [
      'pull_request.*',
      'issues.*',
      'schedule.repository'
    ]
    this.supportedSettings = {
      visibility: 'string',
      topics: {
        must_include: {
          regex: 'string',
          regex_flag: 'string',
          message: 'string'
        },
        must_exclude: {
          regex: 'string',
          regex_flag: 'string',
          message: 'string'
        }
      }
    }
  }

  async filter (context, settings) {
    let result = this.processOptions(context, settings)
    return result
  }
}

module.exports = Repository
