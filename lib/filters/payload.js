const { Filter } = require('./filter')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructError')
const _ = require('lodash')
const { forEach } = require('p-iteration')

const options = ['boolean', 'must_include', 'must_exclude', 'one_of', 'none_of']

async function recursveThruFields (filterObj, context, currentPath, output, payload, field) {
  await forEach(Object.keys(field), async key => {
    if (key === 'do') return

    if (options.includes(key)) {
      output.push(await filterObj.processOptions(context, payload, Object.assign(field, { do: currentPath })))
    } else if (_.isUndefined(payload[key])) {
      output.push(constructError(filterObj, '', field, `${currentPath + '.' + key} does NOT exist`))
    } else {
      await recursveThruFields(filterObj, context, `${currentPath + '.' + key}`, output, payload[key], field[key])
    }
  })
}

class Payload extends Filter {
  constructor () {
    super('payload')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*',
      'issue_comment.*'
    ]
    // no specific supported settings because it can vary by events
    this.supportedSettings = {}
  }

  async filter (context, settings) {
    const output = []

    await recursveThruFields(this, context, 'payload', output, this.getPayload(context, true), settings)

    const filter = {
      name: settings.do,
      supportedOptions: this.supportedOptions
    }
    return consolidateResult(output, filter)
  }

  // skip validation because the number of possible fields to check vary by event
  validateSettings (supportedSettings, settingToCheck, nestings = []) {
  }
}

module.exports = Payload
