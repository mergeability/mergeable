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

  let results = await stale.processValidate(context, settings)
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

  let results = await stale.processValidate(context, settings)
  // no types specified so we assume both types. Hence none passed to search API.
  expect(isParamsNoType(context)).toBe(true)
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
  expect(results.status).toBe('pass')
})
describe('metadata queries', () => {
  beforeEach(() => {

  })

  test('will set milestones correctly', async () => {
    let settings = { do: 'stale', days: 10, ignore_milestones: true }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(true)
    expect(isMetadataIncluded(context, false, true)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set projects correctly', async () => {
    let settings = { do: 'stale', days: 10, ignore_projects: true }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(true)
    expect(isMetadataIncluded(context, true, false)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will not set milestones and projects if not specified', async () => {
    let settings = { do: 'stale', days: 10 }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(true)
    expect(isMetadataIncluded(context, false, false)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set projects and milestones correctly', async () => {
    let settings = { do: 'stale', days: 10, ignore_projects: true, ignore_milestones: true }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(true)
    expect(isMetadataIncluded(context, true, true)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })
})
describe('label queries', () => {
  beforeEach(() => {

  })

  test('will set label matches and ignores correctly', async () => {
    let settings = { do: 'stale', days: 10, label: { match: ['test_match1', 'test_match2'], ignore: ['test_ignore'] } }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, 'label:"test_match1" label:"test_match2" -label:"test_ignore"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set label matches correctly', async () => {
    let settings = { do: 'stale', days: 10, label: { match: ['test_match1', 'test_match2'] } }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, 'label:"test_match1" label:"test_match2"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will set label ignores correctly', async () => {
    let settings = { do: 'stale', days: 10, label: { ignore: ['test_ignore', 'test_ignore2'] } }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoType(context)).toBe(true)
    expect(isParamsNoLabel(context)).toBe(false)
    expect(getFilteredParams(context, '-label:"test_ignore" -label:"test_ignore2"').length).toBe(1)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })

  test('will not add any label queries when no label is specified in match settings', async () => {
    let settings = { do: 'stale', days: 10 }

    let stale = new Stale()
    let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
    ])

    let results = await stale.processValidate(context, settings)
    // no types specified so we assume both types. Hence none passed to search API.
    expect(isParamsNoLabel(context)).toBe(true)
    expect(results.schedule.issues.length).toBe(1)
    expect(results.schedule.pulls.length).toBe(1)
    expect(results.status).toBe('pass')
  })
})

test('will set the issues and pulls even when unsupported type is set', async () => {
  let settings = { do: 'stale', days: 10, type: ['junk1', 'junk2'] }

  let stale = new Stale()
  let context = createMockContext([
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
  let settings = {
    do: 'stale',
    days: 10,
    type: ['issues']
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
  res = await stale.processValidate(context, settings)
  expect(res.status).toBe('fail')
})

test('will set the issues and pulls correctly when type is pull_request only', async () => {
  let settings = {
    do: 'stale',
    days: 10,
    type: ['pull_request']
  }

  let stale = new Stale()
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

    let stale = new Stale()
    let context = createMockContext([])

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

    let stale = new Stale()
    let context = createMockContext([{ number: 1, pull_request: {} }])

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

    let stale = new Stale()
    let context = createMockContext([{ number: 1, pull_request: {} }])

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

const isParamsNoLabel = (context) => {
  return context.github.search.issuesAndPullRequests.mock.calls
    .filter(
      param => param[0].q.includes('label:')
    ).length === 0
}

const isMetadataIncluded = (context, project, milestone) => {
  return context.github.search.issuesAndPullRequests.mock.calls
    .filter(
      param => (milestone === param[0].q.includes('no:milestone')) && (project === param[0].q.includes('no:project'))
    ).length !== 0
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
