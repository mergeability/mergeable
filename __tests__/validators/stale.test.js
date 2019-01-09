const Helper = require('../../__fixtures__/helper')
const Stale = require('../../lib/validators/stale')

test('will set the issues and pulls appropriately when both types are specified', async () => {
  let settings = {
    do: 'stale',
    days: 10,
    type: ['issues', 'pull_request']
  }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)

  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
})

test('will set the issues and pulls appropriately when no type is set', async () => {
  let settings = { do: 'stale', days: 10 }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)
  expect(results.schedule.issues.length).toBe(1)
  expect(results.schedule.pulls.length).toBe(1)
})

test('will set the issues and pulls even when unsupported type is set', async () => {
  let settings = { do: 'stale', days: 10, type: ['junk1', 'junk2'] }

  let stale = new Stale()
  let context = createMockContext([
      { number: 1 },
      { number: 2, pull_request: {} }
  ])

  let results = await stale.validate(context, settings)
  let callParam = context.github.search.issues.mock.calls
  expect(callParam[0][0].q.includes('type')).toBeFalsy()
  expect(results.schedule.issues).toBeDefined()
  expect(results.schedule.pulls).toBeDefined()

  settings.type = ['junk', 'issues']
  results = await stale.validate(context, settings)
  expect(callParam[1][0].q.includes('type:issues')).toBeTruthy()
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

  expect(res.schedule.issues.length).toBe(1)
  expect(res.schedule.pulls.length).toBe(0)
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
  expect(res.schedule.pulls.length).toBe(1)
  expect(res.schedule.issues.length).toBe(0)
})

const createMockContext = (results) => {
  let context = Helper.mockContext()

  context.github.search = {
    issues: jest.fn().mockReturnValue({
      data: { items: results }
    })
  }

  // context.github.search = {
  //   issues: jest.fn(p => {
  //     return { data: { items: results } }
  //   })
  // }

  return context
}
