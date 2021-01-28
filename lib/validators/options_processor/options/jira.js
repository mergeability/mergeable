const JiraApi = require('jira-client')

const REGEX_NOT_FOUND_ERROR = `Failed to run the test because 'regex' is not provided for 'jira' option. Please check README for more information about configuration`

class Jira {
  static async process (validatorContext, input, rule) {
    let isMergeable
    let regexObj

    const filter = rule.jira
    let description = filter['message']
    let regex = filter['regex']
    if (!regex) {
      throw new Error(REGEX_NOT_FOUND_ERROR)
    }

    const DEFAULT_SUCCESS_MESSAGE = `The JIRA TICKET is valid`
    if (!description) description = `The JIRA TICKET is not valid`

    // Parse the codes
    try {
      let regexFlag = 'i'
      if (filter.regex_flag) {
        regexFlag = filter.regex_flag === 'none' ? '' : filter.regex_flag
      }

      regexObj = new RegExp(regex, regexFlag)
    } catch (err) {
      throw new Error(`Failed to create a regex expression with the provided regex: ${regex}`)
    }

    const ticketID = regexObj.exec(input)

    if (ticketID != null && ticketID.length > 0) {
      try {
        isMergeable = await this.checkTicketStatus(ticketID[0])
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

  static async checkTicketStatus (ticketID) {
    try {
      // Initialize the JIRA plugin
      var jira = new JiraApi({
        protocol: process.env.JIRA_PROTOCOL || 'https',
        host: process.env.JIRA_HOST,
        username: process.env.JIRA_USERNAME,
        password: process.env.JIRA_PASSWORD,
        apiVersion: process.env.JIRA_VERSION || '2',
        strictSSL: process.env.JIRA_STRICT_SSL || true
      })

      try {
        await jira.findIssue(ticketID)
        return true
      } catch (error) {
        return false
      }
    } catch (err) {
      throw new Error(`A problem occured with JIRA initilization: ${err}`)
    }
  }
}

module.exports = Jira
