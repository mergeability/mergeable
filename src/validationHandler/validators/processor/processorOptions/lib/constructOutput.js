/**
 * Contruct Output
 * Allows the processor Options module to create the uniform output type
 *
 * Expected Input:
 * validatorContext: {
 *  name: validatorName
 * }
 *
 * input the rule was run against
 * rule: {
 *    // rule used during the test
 * }
 *
 *
 * result: {
 *   status: 'pass|fail|error'
 *   description : 'Default or custom message'
 * }
 *
 * Output format:
 * output : {
 *   validatorName: // Validator that was run
 *   status: 'pass|fail|error'
 *   description: 'Defaul or custom Message'
 *   details {
 *     input: // input the tests are run against
 *     setting: rule
 *   }
 * }
 *
 * @author Shine Lee <aungshine@gmail.com>
 *
 */
module.exports = (validatorContext, input, rule, result) => {
  return {
    validator: validatorContext.name,
    status: result.status,
    description: result.description,
    details: {
      input: input,
      settings: rule
    }
  }
}
