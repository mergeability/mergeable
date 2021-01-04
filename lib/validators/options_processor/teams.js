const TeamNotFoundError = require('./../../errors/teamNotFoundError')
const _ = require('lodash')

class Teams {
  static async extractTeamMembers (context, teams) {
    let teamMembers = []

    if (!teams || teams.length === 0) return teamMembers

    for (let team of teams) {
      let members = []
      try {
        members = await getTeamMembers(context, team)
      } catch (err) {
        throw err
      }

      teamMembers = teamMembers.concat(members)
    }
    return _.uniq(teamMembers)
  }

  static async extractTeamMemberships (context, teams, users) {
    const teamMembers = []
    let membershipState = false

    if (!teams || teams.length === 0) return teamMembers

    for (let user of users) {
      for (let team of teams) {
        try {
          membershipState = await getTeamMembershipState(context, team, user)
        } catch (err) {
          throw err
        }

        if (membershipState) { teamMembers.push(user) }
      }
    }
    return _.uniq(teamMembers)
  }
}

const getTeamMembers = async (context, team) => {
  const stringArray = team.split('/')
  if (stringArray.length !== 2) {
    throw Error(`each team id needs to be given in 'org/team_slug'`)
  }
  if (stringArray[0].indexOf('@') === 0) stringArray[0] = stringArray[0].substring(1)

  const org = stringArray[0]
  const teamSlug = stringArray[1]

  let res
  try {
    res = await context.github.teams.listMembersInOrg({
      org,
      team_slug: teamSlug
    })
  } catch (err) {
    if (err.status === 404) {
      throw new TeamNotFoundError(team)
    }
    throw err
  }

  return res.data.map(member => member.login)
}

const getTeamMembershipState = async (context, team, username) => {
  const stringArray = team.split('/')
  if (stringArray.length !== 2) {
    throw Error(`each team id needs to be given in 'org/team_slug'`)
  }
  if (stringArray[0].indexOf('@') === 0) stringArray.shift()

  const org = stringArray[0]
  const teamSlug = stringArray[1]

  let res
  try {
    res = await context.github.teams.getMembershipInOrg({
      org,
      team_slug: teamSlug,
      username: username
    })
  } catch (err) {
    if (err.status === 404) {
      return false
    }
    throw err
  }

  return (res.data.state === 'active')
}

module.exports = Teams