const MetaData = require('../../../lib/metaData')
const Checks = require('../../../lib/actions/checks')
const Helper = require('../../../__fixtures__/unit/helper')

test.each([
  undefined,
  'pull_request',
  'pull_request_review',
  'issue_comment'
])('that checks is called for %s events', async (eventName) => {
  const checks = new Checks()
  const context = createMockContext(eventName)
  const result = {}
  const settings = {
    payload: {},
    state: 'completed',
    status: 'success'
  }

  const name = undefined

  checks.checkRunResult = new Map()

  checks.checkRunResult.set(name, {
    data: {
      id: '3'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
})

test('that run calls create api', async () => {
  const checks = new Checks()
  const context = createMockContext()
  await checks.run({ context, payload: {} })
  expect(context.octokit.checks.create.mock.calls.length).toBe(1)
})

test('that checks created when doPostAction is called with proper parameter', async () => {
  const checks = new Checks()
  const context = createMockContext()
  const settings = { name: 'test' }

  await checks.beforeValidate(context, settings)
  expect(context.octokit.checks.create.mock.calls.length).toBe(1)
})

test('that beforeValidate stores the name correctly', async () => {
  const checks = new Checks()
  const context = createMockContext()

  const settings = {
    payload: {
      title: 'Your run has returned the following status: {{status}}',
      summary: 'This is the summary'
    }
  }

  const name = 'test recipe'

  checks.checkRunResult = new Map()

  await checks.beforeValidate(context, settings, name)
  expect(context.octokit.checks.create.mock.calls.length).toBe(1)
  const callParams = context.octokit.checks.create.mock.calls[0][0]
  expect(callParams.name).toBe('Mergeable: test recipe')
  expect(checks.checkRunResult.has(name)).toBe(true)
})

test('that `conclusion` and `completed_at` fields are not set when `settings.state` is not `completed`', async () => {
  const checks = new Checks()
  const context = createMockContext()
  const result = {
    errorCount: 0,
    failCount: 1,
    failures: [{
      name: 'approvals'
    }]
  }
  const settings = {
    state: 'in_progress',
    status: null,
    payload: {
      title: 'This is the title',
      summary: 'This is the summary'
    }
  }

  const name = undefined

  checks.checkRunResult = new Map()
  checks.checkRunResult.set(name, {
    data: {
      id: '3'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  const response = context.octokit.checks.update.mock.calls[0][0]
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
  expect(response.status).toBe('in_progress')
  expect(MetaData.exists(response.conclusion)).toBe(false)
  expect(MetaData.exists(response.completed_at)).toBe(false)
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
      title: 'Your run has returned the following status: {{status}}',
      summary: 'This is the summary'
    }
  }

  const name = undefined

  checks.checkRunResult = new Map()

  checks.checkRunResult.set(name, {
    data: {
      id: '3'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  const output = context.octokit.checks.update.mock.calls[0][0].output
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
  expect(output.summary).toBe('This is the summary')
  expect(output.title).toBe('Your run has returned the following status: pass')
  expect(MetaData.exists(output.text)).toBe(false)
})

test('that afterValidate is replacing special annotations in payload', async () => {
  const checks = new Checks()
  const context = createMockContext()
  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }],
    completed_at: '2024-06-15T19:14:00Z'
  }
  const settings = {
    payload: {
      title: '@author @sender @bot @repository @action {{formatDate completed_at}} , completed!',
      summary: '@author @sender @bot @repository @action {{formatDate completed_at}} , summary',
      text: '@author @sender @bot @repository @action {{formatDate completed_at}} , text'
    }
  }

  const name = undefined

  checks.checkRunResult = new Map()

  checks.checkRunResult.set(name, {
    data: {
      id: '3'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  const output = context.octokit.checks.update.mock.calls[0][0].output
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
  expect(output.title).toBe('creator initiator Mergeable[bot] fullRepoName actionName Jun 15, 2024, 7:14 PM , completed!')
  expect(output.summary).toBe('creator initiator Mergeable[bot] fullRepoName actionName Jun 15, 2024, 7:14 PM , summary')
  expect(output.text).toContain('creator initiator Mergeable[bot] fullRepoName actionName Jun 15, 2024, 7:14 PM , text')
  expect(MetaData.exists(output.text)).toBe(true)
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
      title: 'Your run has returned the following status: {{status}}',
      summary: 'This is the summary',
      text: 'Errors occured.'
    }
  }

  const name = undefined

  checks.checkRunResult = new Map()

  checks.checkRunResult.set(name, {
    data: {
      id: '4'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  const output = context.octokit.checks.update.mock.calls[0][0].output
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
  expect(output.summary).toBe('This is the summary')
  expect(output.title).toBe('Your run has returned the following status: fail')
  expect(MetaData.exists(output.text)).toBe(true)
})

test('that correct name is used afterValidate payload', async () => {
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
      title: 'Your run has returned the following status: {{status}}',
      summary: 'This is the summary',
      text: 'Errors occured.'
    }
  }

  const name = 'test recipe'

  checks.checkRunResult = new Map()

  checks.checkRunResult.set(name, {
    data: {
      id: '4'
    }
  })

  await checks.afterValidate(context, settings, name, result)
  const output = context.octokit.checks.update.mock.calls[0][0].output
  expect(context.octokit.checks.update.mock.calls.length).toBe(1)
  const payload = context.octokit.checks.update.mock.calls[0][0]
  expect(payload.name).toBe(`Mergeable: ${name}`)
  expect(MetaData.exists(output.text)).toBe(true)
})

const createMockContext = (eventName = undefined) => {
  const context = Helper.mockContext({ eventName })
  context.payload.action = 'actionName'
  context.octokit.checks.create = jest.fn()
  context.octokit.checks.update = jest.fn()
  return context
}
