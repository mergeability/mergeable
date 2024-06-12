const Close = require('../../../lib/actions/close')
const Helper = require('../../../__fixtures__/unit/helper')

test.each([
  undefined,
  'pull_request',
  'issues',
  'issue_comment',
  'schedule'
])('check that close is called for %s events', async (eventName) => {
  const close = new Close()
  const context = Helper.mockContext({ eventName: eventName })
  const schedulerResult = {
    validationSuites: [{
      schedule: {
        issues: [{ number: 1, user: { login: 'scheduler' } }],
        pulls: []
      }
    }]
  }

  await close.afterValidate(context, {}, '', schedulerResult)
  expect(context.octokit.issues.update.mock.calls.length).toBe(1)
})

test('check that issue is closed', async () => {
  const close = new Close()
  const context = Helper.mockContext()

  await close.afterValidate(context)
  expect(context.octokit.issues.update.mock.calls.length).toBe(1)
  expect(context.octokit.issues.update.mock.calls[0][0].state).toBe('closed')
})

test('check that issues from scheduler are closed', async () => {
  const close = new Close()
  const context = Helper.mockContext({ eventName: 'schedule' })
  const schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]
  await close.afterValidate(context, {}, '', schedulerResult)
  expect(context.octokit.issues.update.mock.calls.length).toBe(3)
  expect(context.octokit.issues.update.mock.calls[0][0].state).toBe('closed')
  expect(context.octokit.issues.update.mock.calls[1][0].state).toBe('closed')
  expect(context.octokit.issues.update.mock.calls[2][0].state).toBe('closed')
})
