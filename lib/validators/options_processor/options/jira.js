var JiraApi = require('jira-client');

const ENABLED_NOT_FOUND_ERROR = `Failed to run the test because 'enabled' is not provided for 'jira' option. Please check README for more information about configuration`
const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected string as input`

class Jira {
  static async process(validatorContext, input, rule) {
    let isMergeable
    let regexObj

    const filter = rule.jira
    const enabled = filter['enabled']
    let description = filter['message']
    if (!enabled && enabled !== false) {
      throw new Error(ENABLED_NOT_FOUND_ERROR)
    }

    if (enabled === false) {
      return {
        status: 'pass',
        description: 'Jira option is not enabled, as such this validator did not run'
      }
    }

    const DEFAULT_SUCCESS_MESSAGE = `The JIRA TICKET is valid`
    if (!description) description = `The JIRA TICKET is not valid`

    // Parse the codes
    const regex = '[A-Z][A-Z0-9]+-\\d+'

    try {
      regexObj = new RegExp(regex)
    } catch (err) {
      throw new Error(`Failed to create a regex expression with the provided regex: ${regex}`)
    }

    const ticketID = regexObj.exec(input)

    if (ticketID != null && ticketID.length > 0) {
      try {
        isMergeable = await checkTicketStatus(ticketID[0])
      } catch (err) {
        isMergeable = false
      }
    } else {
      isMergeable = false
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : description
    }
  }
}

async function checkTicketStatus (ticketID) {
  let issue = false

  try {
    // Initialize the JIRA plugin
    var jira = new JiraApi({
      protocol: process.env.JIRA_PROTOCOL || 'https',
      host: process.env.JIRA_HOST,
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_PASSWORD,
      apiVersion: process.env.JIRA_VERSION || '2',
      strictSSL: process.env.JIRA_STRICT_SSL || true,
    });

    issue = await jira.findIssue(ticketID);
    
  } catch (err) {
    throw new Error(`A problem occured with JIRA initilization: ${err}`)
  }

  return issue
}

module.exports = Jira
