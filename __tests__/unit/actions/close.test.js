const Close = require('../../../lib/actions/close')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that issue is closed', async () => {
  const close = new Close()
  const context = Helper.mockContext()

  await close.afterValidate(context)
  expect(context.github.issues.update.mock.calls.length).toBe(1)
  expect(context.github.issues.update.mock.calls[0][0].state).toBe('closed')
})

test('check that issues from scheduler are closed', async () => {
  const close = new Close()
  const context = Helper.mockContext({event: 'schedule'})
  let schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
      pulls: []
    }
  }]
  await close.afterValidate(context, {}, '', schedulerResult)
  expect(context.github.issues.update.mock.calls.length).toBe(3)
  expect(context.github.issues.update.mock.calls[0][0].state).toBe('closed')
  expect(context.github.issues.update.mock.calls[1][0].state).toBe('closed')
  expect(context.github.issues.update.mock.calls[2][0].state).toBe('closed')
})
