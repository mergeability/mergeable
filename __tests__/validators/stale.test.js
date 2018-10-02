const Helper = require('../../__fixtures__/helper')
const Stale = require('../../lib/validators/stale')

test('will create comment when configured and stale pulls are found.', async () => {
  const stale = new Stale()
  const context = createMockContextWithPullsSetting([{number: 1}])
  const config = {
    do: 'stale',
    days: 20
  }

  await stale.validate(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
})

test('will create comment when configured and stale issues are found.', async () => {
  const stale = new Stale()
  let context = createMockContextWithIssueSetting([{number: 1}])
  let config = {
    do: 'stale',
    days: 20
  }

  await stale.validate(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
})

test('will create comment when configured issues are found and multiple issues are found.', async () => {
  const stale = new Stale()
  let context = createMockContextWithIssueSetting([{number: 1}, {number: 2}])
  let config = {
    do: 'stale',
    days: 20
  }

  await stale.validate(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(2)
})

test('will NOT create comment when configured and stale pulls are not found.', async () => {
  const stale = new Stale()
  let context = createMockContextWithIssueSetting([])
  let config = {
    do: 'stale',
    days: 20
  }

  await stale.validate(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(0)
})

test('will NOT create comment when configured and stale issues are not found.', async () => {
  const stale = new Stale()
  let context = createMockContextWithPullsSetting([])
  let config = {
    do: 'stale',
    days: 20
  }

  await stale.validate(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(0)
})

const createMockContextWithIssueSetting = (results) => {
  let context = createMockContext(results)
  Helper.mockConfigWithContext(context, `
    mergeable:
      issues:
        stale:
          days: 20
    `)

  return context
}

const createMockContextWithPullsSetting = (results) => {
  let context = createMockContext(results)
  Helper.mockConfigWithContext(context, `
    mergeable:
      pull_requests:
        stale:
          days: 20
    `)

  return context
}

const createMockContext = (results) => {
  let context = Helper.mockContext()

  context.github.search = {
    issues: jest.fn().mockReturnValue({
      data: { items: results }
    })
  }

  context.github.issues.createComment = jest.fn()
  return context
}
