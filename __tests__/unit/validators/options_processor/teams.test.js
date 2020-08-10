const Helper = require('../../../../__fixtures__/unit/helper')
const teams = require('../../../../lib/validators/options_processor/teams')
const teamNotFoundError = require('../../../../lib/errors/teamNotFoundError')

test('teams members are extracted properly', async () => {
  let members = [
    {login: 'member1'},
    {login: 'member2'}
  ]

  let res = await teams.extractTeamMembers(createMockContext(members), ['org/team1', 'org/team2'])
  expect(res.length).toBe(2)
  expect(res[0]).toBe('member1')
  expect(res[1]).toBe('member2')
})

test('throws teamNotFound error if at least one team is not found', async () => {
  let context = createMockContext()
  context.github.teams.listMembersInOrg = () => {
    let error = new Error('404 error')
    error.status = 404
    throw error
  }

  try {
    await teams.extractTeamMembers(context, ['org/team1', 'org/team2'])
  } catch (err) {
    expect(err instanceof teamNotFoundError).toBe(true)
  }
})

const createMockContext = (listMembers) => {
  return Helper.mockContext({
    listMembers
  })
}
