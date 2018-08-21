const consolidateResult = require('./options/lib/consolidateResults')
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
        try {
          if (validatorContext.supportedOptions && validatorContext.supportedOptions.indexOf(key) === -1) {
            output.push(constructOutput(validatorContext, input, rule, {
              mergeable: false,
              status: 'error',
              description: `The '${key}' option is not supported for '${validatorContext.name}' validator, please see README for all available options`
            }))
          } else {
            output.push(require(`./options/${key}`).process(validatorContext, input, rule))
          }
        } catch (err) {
          output.push(constructOutput(validatorContext, input, rule, {
            mergeable: false,
            status: 'error',
            description: `The '${key}' option is not supported for '${validatorContext.name}' validator, please see README for all available options`
          }))
        }
      })
    })

    return returnRawOutput ? output : consolidateResult(output)
  }
}

module.exports = Options
