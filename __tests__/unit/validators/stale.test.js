const Helper = require('../../../__fixtures__/unit/helper')
const Stale = require('../../../lib/validators/stale')
const moment = require('moment-timezone')

jest.mock('moment-timezone', () => jest.fn().mockReturnValue((({
  utc: jest.fn().mockReturnValue(({
    tz: jest.fn(),
    day: jest.fn().mockReturnValue(1),
    hour: jest.fn().mockReturnValue(8),
    format: () => '2018–01–30T12:34:56+00:00'
  }))
}))))

// Stale relies on the search api:
// https://help.github.com/articles/searching-issues-and-pull-requests/#search-only-issues-or-pull-requests
// Tests should ensure that the parameters passed into the API is accurate
test('will set the issues and pulls appropriately when both types are specified', async () => {
  const settings = {
    do: 'stale',
    days: 10,
    type: ['issues', 'pull_request'] // this is valid when using the new config.
  }

  const stale = new Stale()
  const context = createMockContext([
    { number: 1 },
    { number: 2, pull_request: {} }
  ])

  const results = await stale.processValidate(context, settings)
  expect(isParamsNoType(context)).toBe(true) // it includes both types.
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
  expect(results.status).toBe('pass')
})

test('will set the issues and pulls appropriately when no type is set', async () => {
  const settings = { do: 'stale', days: 10 }

  const stale = new Stale()
  const context = createMockContext([
    { number: 1 },
    { number: 2, pull_request: {} }
  ])

  const results = await stale.processValidate(context, settings)
  // no types specified so we assume both types. Hence none passed to search API.
  expect(isParamsNoType(context)).toBe(true)
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
  expect(results.status).toBe('pass')
})
describe('metadata queries', () => {
  beforeEach(() => {

  })

  test.each([
    { draft: true, milestones: true, projects: true },
    { draft: false, milestones: true, projects: true },
    { draft: true, milestones: false, projects: true },
    { draft: true, milestones: true, projects: false },
    { draft: false, milestones: false, projects: true },
    { draft: true, milestones: false, projects: false },
    { draft: false, milestones: true, projects: false },
    { draft: false, milestones: false, projects: false }
  ])('will set %s correctly', async ({ draft, milestones, projects }) => {
    const settings = { do: 'stale', days: 10, ignore_drafts: draft, ignore_milestones: milestones, ignore_projects: projects }

    const stale = new Stale()
    const context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    const results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(true)
    expect(isMetadataIncluded(context, draft, milestones, projects)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })
})
describe('label queries', () => {
  beforeEach(() => {

  })

  test('will set label matches and ignores correctly', async () => {
    const settings = { do: 'stale', days: 10, label: { match: ['test_match1', 'test_match2'], ignore: ['test_ignore'] } }

    const stale = new Stale()
    const context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    const results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, 'label:"test_match1" label:"test_match2" -label:"test_ignore"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set label matches correctly', async () => {
    const settings = { do: 'stale', days: 10, label: { match: ['test_match1', 'test_match2'] } }

    const stale = new Stale()
    const context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    const results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, 'label:"test_match1" label:"test_match2"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set label ignores correctly', async () => {
    const settings = { do: 'stale', days: 10, label: { ignore: ['test_ignore', 'test_ignore2'] } }

    const stale = new Stale()
    const context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    const results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, '-label:"test_ignore" -label:"test_ignore2"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will not add any label queries when no label is specified in match settings', async () => {
    const settings = { do: 'stale', days: 10 }

    const stale = new Stale()
    const context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    const results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoLabel(context)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })
})

test('will set the issues and pulls even when unsupported type is set', async () => {
  const settings = { do: 'stale', days: 10, type: ['junk1', 'junk2'] }

  const stale = new Stale()
  const context = createMockContext([
    { number: 1 },
    { number: 2, pull_request: {} }
  ])

  let results = await stale.processValidate(context, settings)
  expect(isParamsNoType(context)).toBe(true) // if non supported is specified we still don't specify.
  expect(results.schedule.issues).toBeDefined()
  expect(results.schedule.pulls).toBeDefined()

  settings.type = ['junk', 'issues']
  results = await stale.processValidate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(1) // should have called with type:issue
  expect(results.schedule.issues).toBeDefined()
  expect(results.schedule.pulls).toBeDefined()
})

test('will set the issues and pulls correctly when type is issue only', async () => {
  const settings = {
    do: 'stale',
    days: 10,
    type: ['issues']
  }

  const stale = new Stale()
  let context = createMockContext([{ number: 1 }])

  let res = await stale.validate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(1)
  expect(getFilteredParams(context, 'type:pr').length).toBe(0)
  expect(res.schedule.issues.length).toBe(1)
  expect(res.schedule.pulls.length).toBe(0)
  expect(res.status).toBe('pass')

  // no issues came back.
  context = createMockContext([])
  res = await stale.processValidate(context, settings)
  expect(res.status).toBe('fail')
})

test('will set the issues and pulls correctly when type is pull_request only', async () => {
  const settings = {
    do: 'stale',
    days: 10,
    type: ['pull_request']
  }

  const stale = new Stale()
  let context = createMockContext([{ number: 1, pull_request: {} }])

  let res = await stale.processValidate(context, settings)
  expect(getFilteredParams(context, 'type:issue').length).toBe(0)
  expect(getFilteredParams(context, 'type:pr').length).toBe(1)
  expect(res.schedule.pulls.length).toBe(1)
  expect(res.schedule.issues.length).toBe(0)
  expect(res.status).toBe('pass')

  // no prs came back
  context = createMockContext([])
  res = await stale.processValidate(context, settings)
  expect(res.status).toBe('fail')
})

describe('limit option', () => {
  beforeEach(() => {

  })

  test('time_zone option works correctly', async () => {
    const timeZone = 'America/Los_Angeles'
    let settings = {
      do: 'stale',
      days: 10
    }

    const stale = new Stale()
    const context = createMockContext([])

    await stale.processValidate(context, settings)
    expect(moment().utc().tz.mock.calls.length).toBe(0)

    settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        time_zone: timeZone
      }
    }

    await stale.processValidate(context, settings)
    expect(moment().utc().tz.mock.calls.length).toBe(1)
    expect(moment().utc().tz.mock.calls[0][0]).toBe(timeZone)
  })

  test('days_of_week option works correctly', async () => {
    let settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        days_of_week: ['Sun']
      }
    }

    const stale = new Stale()
    const context = createMockContext([{ number: 1, pull_request: {} }])

    let res = await stale.processValidate(context, settings)
    expect(res.status).toBe('fail')

    settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        days_of_week: ['Mon']
      }
    }

    res = await stale.processValidate(context, settings)
    expect(res.status).toBe('pass')
  })

  test('hours_between option works correctly', async () => {
    let settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        hours_between: ['7', '17']
      }
    }

    const stale = new Stale()
    const context = createMockContext([{ number: 1, pull_request: {} }])

    let res = await stale.processValidate(context, settings)
    expect(res.status).toBe('pass')

    settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        hours_between: ['9', '17']
      }
    }

    res = await stale.processValidate(context, settings)
    expect(res.status).toBe('fail')

    settings = {
      do: 'stale',
      days: 10,
      time_constraint: {
        hours_between: ['1', '7']
      }
    }

    res = await stale.processValidate(context, settings)
    expect(res.status).toBe('fail')
  })
})

const getFilteredParams = (context, filter = '', days = 10) => {
  const callParams = context.octokit.search.issuesAndPullRequests.mock.calls
  const timestamp = (new Date(new Date() - days * 24 * 60 * 60 * 1000)).toISOString().replace(/\.\d{3}\w$/, '')
  const q = `repo:owner/repo is:open updated:<${timestamp} ${filter}`.trim()
  return callParams.filter(param => param[0].q === q)
}

const isParamsNoType = (context) => {
  return context.octokit.search.issuesAndPullRequests.mock.calls
    .filter(
      param => param[0].q.includes('type:')
    ).length === 0
}

const isParamsNoLabel = (context) => {
  return context.octokit.search.issuesAndPullRequests.mock.calls
    .filter(
      param => param[0].q.includes('label:')
    ).length === 0
}

const isMetadataIncluded = (context, draft, milestone, project) => {
  return context.octokit.search.issuesAndPullRequests.mock.calls
    .filter(
      param =>
        (draft === param[0].q.includes('-is:draft')) &&
        (project === param[0].q.includes('no:project')) &&
        (milestone === param[0].q.includes('no:milestone')) &&
        true
    ).length !== 0
}

const createMockContext = (results) => {
  const context = Helper.mockContext()

  context.octokit.search = {
    issuesAndPullRequests: jest.fn().mockReturnValue({
      data: { items: results }
    })
  }
  return context
}
