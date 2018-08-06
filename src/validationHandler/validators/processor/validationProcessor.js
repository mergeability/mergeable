const consolidateResult = require('./processorOptions/lib/consolidateResults')
const constructOupt = require('./processorOptions/lib/constructOutput')

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
 *
 * @author Shine Lee (aungshine@gmail.com)
 *
 * @param validatorContext
 * @param input
 * @param rules
 * @returns {{mergeable, description}}
 */

const SUPPORTED_OPTIONS = ['and',
  'or',
  'begins_with',
  'ends_with',
  'max',
  'min',
  'must_exclude',
  'must_include',
  'no_empty',
  'required']

const validationProcessor = (validatorContext, input, rules) => {
  const output = []
  rules.forEach(rule => {
    Object.keys(rule).forEach(key => {
      if (SUPPORTED_OPTIONS.indexOf(key) === -1) {
        output.push(constructOupt(validatorContext, input, rule, {
          mergeable: false,
          status: 'error',
          description: `The '${key}' option is not supported for '${validatorContext.name}' validator, please see README for all available options`
        }))
      } else {
        output.push(require(`./processorOptions/${key}`)(validatorContext, input, rule))
      }
    })
  })

  return consolidateResult(output)
}

module.exports = validationProcessor
