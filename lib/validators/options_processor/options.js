const consolidateResult = require('./options/lib/consolidateResults')
const constructError = require('./options/lib/constructErrorOutput')
const constructOutput = require('./options/lib/constructOutput')

/**
 * Validation Processor
 * Process tests on the input based on the set of rules
 *
 * Params must be in the follow format
 * validatorContext: {
 *   name: validatorName
 * }
 * Input: string or an Array to run test against
 *
 * Rules: [{
 *   option: either JSON object or Array of JSON objects
 * }]
 *
 * @param validatorContext
 * @param input
 * @param rules
 * @returns {{mergeable, description}}
 */

class Options {
  static process (validatorContext, input, rules, returnRawOutput) {
    const output = []
    if (!Array.isArray(rules)) {
      rules = [rules]
    }

    rules.forEach(rule => {
      Object.keys(rule).forEach(key => {
        if (key === 'do') return
        const setting = {}
        setting[key] = rule[key]
        try {
          if (validatorContext.supportedOptions && validatorContext.supportedOptions.indexOf(key) === -1) {
            output.push(constructError(validatorContext, input, setting, `The '${key}' option is not supported for '${validatorContext.name}' validator, please see README for all available options`))
          } else {
            const result = require(`./options/${key}`).process(validatorContext, input, rule)
            output.push(constructOutput(validatorContext, input, setting, result))
          }
        } catch (err) {
          output.push(constructError(validatorContext, input, setting, err.message))
        }
      })
    })

    return returnRawOutput ? output : consolidateResult(output, validatorContext)
  }
}

module.exports = Options
