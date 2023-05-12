const _ = require('lodash')
const GithubAPI = require('../../github/api')
const constructOutput = require('./options/lib/constructOutput')
const consolidateResult = require('./options/lib/consolidateResults')

class Teams {
  static async extractTeamMembers (context, teams) {
    let teamMembers = []

    if (!teams || teams.length === 0) return teamMembers

    for (const team of teams) {
      let members = []
      members = await getTeamMembers(context, team)
      teamMembers = teamMembers.concat(members)
    }
    return _.uniq(teamMembers)
  }

  static async extractTeamMemberships (context, teams, users) {
    const teamMembers = []
    let membershipState = false

    if (!teams || teams.length === 0) return teamMembers

    for (const user of users) {
      for (const team of teams) {
        membershipState = await getTeamMembershipState(context, team, user)
        if (membershipState) { teamMembers.push(user) }
      }
    }
    return _.uniq(teamMembers)
  }

  static async processTeamOption (context, settings, payload) {
    const teamName = settings.team
    const userName = payload.user.login

    const teamMemberships = await Teams.extractTeamMemberships(context, [teamName], [userName])
    const isMember = teamMemberships.includes(userName)
    const successMessage = `'${userName}' is part of the '${teamName}' team'`
    const failureMessage = `'${userName}' is not part of the '${teamName}' team'`

    const output = [
      constructOutput(
        context, teamMemberships, settings, {
          status: isMember ? 'pass' : 'fail',
          description: isMember ? successMessage : failureMessage
        }, null
      )
    ]
    return consolidateResult(output, context)
  }
}

const getTeamMembers = async (context, team) => {
  const stringArray = team.split('/')
  if (stringArray.length !== 2) {
    throw Error('each team id needs to be given in \'org/team_slug\'')
  }
  if (stringArray[0].indexOf('@') === 0) stringArray[0] = stringArray[0].substring(1)

  const org = stringArray[0]
  const teamSlug = stringArray[1]

  return GithubAPI.listMembersInOrg(context, org, teamSlug)
}

const getTeamMembershipState = async (context, team, username) => {
  const stringArray = team.split('/')
  if (stringArray.length !== 2) {
    throw Error('each team id needs to be given in \'org/team_slug\'')
  }
  if (stringArray[0].indexOf('@') === 0) stringArray[0] = stringArray[0].substring(1)

  const org = stringArray[0]
  const teamSlug = stringArray[1]

  return GithubAPI.getMembershipForUserInOrg(context, org, teamSlug, username)
}

module.exports = Teams
