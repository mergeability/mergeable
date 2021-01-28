const Topics = require('./options_processor/topics')
const Visibility = require('./options_processor/visibility')
const { Filter } = require('./filter')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')

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
    const output = []

    let filter = {
      name: settings.do,
      supportedOptions: this.supportedOptions
    }

    if (settings.topics) {
      let processor = await Topics.process(context, filter, settings)
      output.push(constructOutput(filter, processor.input, { topics: settings.topics }, processor.result))
    }

    if (settings.visibility) {
      let processor = Visibility.process(context, filter, settings)
      output.push(constructOutput(filter, processor.input, { visibility: settings.visibility }, processor.result))
    }

    return consolidateResult(output, filter)
  }
}

module.exports = Repository
