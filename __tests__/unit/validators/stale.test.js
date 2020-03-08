const Helper = require('../../../__fixtures__/unit/helper')
const Stale = require('../../../lib/validators/stale')

// Stale relies on the search api:
// https://help.github.com/articles/searching-issues-and-pull-requests/#search-only-issues-or-pull-requests
// Tests should ensure that the parameters passed into the API is accurate
test('will set the issues and pulls appropriately when both types are specified', async () => {
  let settings = {
    do: 'stale',
    days: 10,
    type: ['issues', 'pull_request'] // this is valid when using the new config.
  }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)
  expect(isParamsNoType(context)).toBe(true) // it includes both types.
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
  expect(results.status).toBe('pass')
})

test('will set the issues and pulls appropriately when no type is set', async () => {
  let settings = { do: 'stale', days: 10 }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)
  // no types specified so we assume both types. Hence none passed to search API.
  expect(isParamsNoType(context)).toBe(true)
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
  expect(results.status).toBe('pass')
})

test('will set the issues and pulls even when unsupported type is set', async () => {
  let settings = { do: 'stale', days: 10, type: ['junk1', 'junk2'] }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)
  expect(isParamsNoType(context)).toBe(true) // if non supported is specified we still don't specify.
  expect(results.schedule.issues).toBeDefined()
  expect(results.schedule.pulls).toBeDefined()

  settings.type = ['junk', 'issues']
  results = await stale.validate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(1) // should have called with type:issue
  expect(results.schedule.issues).toBeDefined()
  expect(results.schedule.pulls).toBeDefined()
})

test('will set the issues and pulls correctly when type is issue only', async () => {
  let settings = {
    do: 'stale',
    days: 10,
    type: 'issues'
  }

  let stale = new Stale()
  let context = createMockContext([{ number: 1 }])

  let res = await stale.validate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(1)
  expect(getFilteredParams(context, 'type:pr').length).toBe(0)
  expect(res.schedule.issues.length).toBe(1)
  expect(res.schedule.pulls.length).toBe(0)
  expect(res.status).toBe('pass')

  // no issues came back.
  context = createMockContext([])
  res = await stale.validate(context, settings)
  expect(res.status).toBe('fail')
})

test('will set the issues and pulls correctly when type is pull_request only', async () => {
  let settings = {
    do: 'stale',
    days: 10,
    type: 'pull_request'
  }

  let stale = new Stale()
  let context = createMockContext([{ number: 1, pull_request: {} }])

  let res = await stale.validate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(0)
  expect(getFilteredParams(context, 'type:pr').length).toBe(1)
  expect(res.schedule.pulls.length).toBe(1)
  expect(res.schedule.issues.length).toBe(0)
  expect(res.status).toBe('pass')

  // no prs came back
  context = createMockContext([])
  res = await stale.validate(context, settings)
  expect(res.status).toBe('fail')
})

const getFilteredParams = (context, filter = '', days = 10) => {
  let callParams = context.github.search.issuesAndPullRequests.mock.calls
  let timestamp = (new Date(new Date() - days * 24 * 60 * 60 * 1000)).toISOString().replace(/\.\d{3}\w$/, '')
  let q = `repo:owner/repo is:open updated:<${timestamp} ${filter}`.trim()
  return callParams.filter(param => param[0].q === q)
}

const isParamsNoType = (context) => {
  return context.github.search.issuesAndPullRequests.mock.calls
    .filter(
      param => param[0].q.includes('type:')
    ).length === 0
}

const createMockContext = (results) => {
  let context = Helper.mockContext()

  context.github.search = {
    issuesAndPullRequests: jest.fn().mockReturnValue({
      data: { items: results }
    })
  }
  return context
}
