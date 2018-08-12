/**
 * validation results are in the following format
 *
 * validationResult : [ {
 *   name: // Validator that was run
 *   status: 'pass|fail|error'
 *   description: 'Default or custom Message'
 *   details {
 *     input: // input the tests are run against
 *     setting: rule
 *   }]
 *
 * @param template
 * @param validationResult
 * @returns {Promise.<void>}
 */
const outputMessageTranslator = async (template, validationResult) =>{

}

module.exports = outputMessageTranslator

const template = `All the Checks were passed!! You are ready to merge! \n
{{#each results}}
{{

{{/each}}`
