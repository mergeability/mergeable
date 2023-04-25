const Teams = require('../teams')

class TeamProcessor {
  static async process (context, input, rule) {
    const userName = input
    const teamName = rule.team

    const SUCCESS_MESSAGE = `'${userName}' is part of the '${teamName}' team'`
    const FAILURE_MESSAGE = `'${userName}' is not part of the '${teamName}' team'`

    const teamMemberships = await Teams.extractTeamMemberships(context, [teamName], [userName])
    const isMember = teamMemberships.includes(userName)

    return {
      status: isMember ? 'pass' : 'fail',
      description: isMember ? SUCCESS_MESSAGE : FAILURE_MESSAGE
    }
  }
}

module.exports = TeamProcessor
