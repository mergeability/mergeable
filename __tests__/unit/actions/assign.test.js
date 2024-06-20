const Assign = require('../../../lib/actions/assign')
const Helper = require('../../../__fixtures__/unit/helper')

test.each([
  undefined,
  'pull_request',
  'issues',
  'issue_comment'
])('check that assign is called for %s events', async (eventName) => {
  const settings = {
    assignees: []
  }

  const assign = new Assign()
  const context = createMockContext(eventName)

  await assign.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
})

test('check that assignees are added when afterValidate is called with proper parameter', async () => {
  const settings = {
    assignees: ['testuser1', 'testuser2']
  }

  const assign = new Assign()
  const context = createMockContext()

  await assign.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('testuser1')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[1]).toBe('testuser2')
})

test('check that creator is added when assignee is @author or @sender or @bot', async () => {
  const settings = {
    assignees: ['@author', '@sender', '@bot']
  }

  const assign = new Assign()
  const context = createMockContext()

  await assign.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('creator')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[1]).toBe('initiator')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[2]).toBe('Mergeable[bot]')
})

test('check only authorized users are added as assignee ', async () => {
  const settings = {
    assignees: ['testuser1', 'testuser2']
  }

  const assign = new Assign()
  const context = createMockContext()

  context.octokit.issues.checkUserCanBeAssigned = (input) => {
    return new Promise((resolve, reject) => {
      if (input.assignee === 'testuser2') {
        resolve({ status: 404 })
      }
      resolve({ status: 204 })
    })
  }

  await assign.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('testuser1')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[1]).toBeUndefined()
})

const createMockContext = (eventName = undefined) => {
  const context = Helper.mockContext({ eventName })

  context.octokit.issues.addAssignees = jest.fn()
  return context
}
