const Helper = require('../__fixtures__/helper')
const stale = require('../lib/stale')
const Configuration = require('../lib/configuration')

test('will create comment when configured and stale pulls are found.', async () => {
  let context = createMockContectWithPullsSetting([{number: 1}])
  let config = await Configuration.instanceWithContext(context)

  await stale(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
})

test('will create comment when configured and stale issues are found.', async () => {
  let context = createMockContectWithIssueSetting([{number: 1}])
  let config = await Configuration.instanceWithContext(context)

  await stale(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
})

test('will create comment when configured issues are found and multiple issues are found.', async () => {
  let context = createMockContectWithIssueSetting([{number: 1}, {number: 2}])
  let config = await Configuration.instanceWithContext(context)

  await stale(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(2)
})

test('will NOT create comment when configured and stale pulls are not found.', async () => {
  let context = createMockContectWithIssueSetting([])
  let config = await Configuration.instanceWithContext(context)
  await stale(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(0)
})

test('will NOT create comment when configured and stale issues are not found.', async () => {
  let context = createMockContectWithPullsSetting([])
  let config = await Configuration.instanceWithContext(context)

  await stale(context, config)
  expect(context.github.issues.createComment.mock.calls.length).toBe(0)
})

const createMockContectWithIssueSetting = (results) => {
  let context = createMockContext(results)
  Helper.mockConfigWithContext(context, `
    mergeable:
      issues:
        stale:
          days: 20
    `)

  return context
}

const createMockContectWithPullsSetting = (results) => {
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
