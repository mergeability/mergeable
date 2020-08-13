const MetaData = require('../../../lib/metaData')
const Checks = require('../../../lib/actions/checks')
const Helper = require('../../../__fixtures__/unit/helper')

test('run', async () => {
  const checks = new Checks()
  const context = createMockContext()
  await checks.run({ context, payload: {} })
  expect(context.github.checks.create.mock.calls.length).toBe(1)
})

test('check that checks created when doPostAction is called with proper parameter', async () => {
  const checks = new Checks()
  const context = createMockContext()

  await checks.beforeValidate({context})
  expect(context.github.checks.create.mock.calls.length).toBe(1)
})

test('that afterValidate is called with properly and output is correct', async () => {
  const checks = new Checks()
  const context = createMockContext()
  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }
  const settings = {
    payload: {
      title: `Your run has returned the following status: {{status}}`,
      summary: 'This is the summary'
    }
  }

  checks.checkRunResult = {
    data: {
      id: '3'
    }
  }

  await checks.afterValidate(context, settings, result)
  let output = context.github.checks.update.mock.calls[0][0].output
  expect(context.github.checks.update.mock.calls.length).toBe(1)
  expect(output.summary).toBe('This is the summary')
  expect(output.title).toBe('Your run has returned the following status: pass')
  expect(MetaData.exists(output.text)).toBe(false)
})

test('that afterValidate is correct when validation fails', async () => {
  const checks = new Checks()
  const context = createMockContext()
  const result = {
    status: 'fail',
    validations: [{
      status: 'fail',
      name: 'Label'
    }]
  }
  const settings = {
    payload: {
      title: `Your run has returned the following status: {{status}}`,
      summary: 'This is the summary',
      text: 'Errors occured.'
    }
  }

  checks.checkRunResult = {
    data: {
      id: '4'
    }
  }

  await checks.afterValidate(context, settings, result)
  let output = context.github.checks.update.mock.calls[0][0].output
  expect(context.github.checks.update.mock.calls.length).toBe(1)
  expect(output.summary).toBe('This is the summary')
  expect(output.title).toBe('Your run has returned the following status: fail')
  expect(MetaData.exists(output.text)).toBe(true)
})

const createMockContext = () => {
  let context = Helper.mockContext()
  context.payload.action = 'actionName'
  context.github.checks.create = jest.fn()
  context.github.checks.update = jest.fn()
  return context
}
