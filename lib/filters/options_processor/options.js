const consolidateResult = require('./options/lib/consolidateResults')
const constructError = require('./options/lib/constructError')
const constructOutput = require('./options/lib/constructOutput')

/**
 * Filter Processor
 * Process filters based on the set of rules
 *
 * Params must be in the follow format
 * filter: {
 *   name: name
 * }
 *
 * Settings: [{
 *   option: either JSON object or Array of JSON objects
 * }]
 *
 * @param context
 * @param filter
 * @param settings
 * @returns {{mergeable, description}}
 */

class Options {
  static process (context, filter, input, settings) {
    const output = []
    if (!Array.isArray(settings)) {
      settings = [settings]
    }

    settings.forEach(setting => {
      Object.keys(setting).forEach(key => {
        if (key === 'do') return
        const rule = {}
        rule[key] = setting[key]
        try {
          if (filter.supportedOptions && filter.supportedOptions.indexOf(key) === -1) {
            output.push(constructError(filter, input, rule, `The '${key}' option is not supported for '${filter.name}' validator, please see README for all available options`))
          } else {
            const result = require(`./options/${key}`).process(context, filter, input, rule)
            output.push(constructOutput(filter, input, rule, result))
          }
        } catch (err) {
          output.push(constructError(filter, input, rule, err.message))
        }
      })
    })

    return consolidateResult(output, filter)
  }
}

module.exports = Options
