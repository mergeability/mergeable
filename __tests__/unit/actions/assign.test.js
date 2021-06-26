const Assign = require('../../../lib/actions/assign')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that assignees are added when afterValidate is called with proper parameter', async () => {
  const settings = {
    assignees: ['testuser1', 'testuser2']
  }

  const comment = new Assign()
  const context = createMockContext()

  await comment.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('testuser1')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[1]).toBe('testuser2')
})

test('check that creator is added when assignee is @author', async () => {
  const settings = {
    assignees: ['@author']
  }

  const comment = new Assign()
  const context = createMockContext()

  await comment.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('creator')
})

test('check only authorized users are added as assignee ', async () => {
  const settings = {
    assignees: ['testuser1', 'testuser2']
  }

  const comment = new Assign()
  const context = createMockContext()

  context.octokit.issues.checkUserCanBeAssigned = (input) => {
    return new Promise((resolve, reject) => {
      if (input.assignee === 'testuser2') {
        resolve({ status: 404 })
      }
      resolve({ status: 204 })
    })
  }

  await comment.afterValidate(context, settings)
  expect(context.octokit.issues.addAssignees.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[0]).toBe('testuser1')
  expect(context.octokit.issues.addAssignees.mock.calls[0][0].assignees[1]).toBeUndefined()
})

const createMockContext = () => {
  const context = Helper.mockContext()

  context.octokit.issues.addAssignees = jest.fn()
  return context
}
