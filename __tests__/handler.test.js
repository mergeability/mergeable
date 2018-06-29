const Helper = require('../__fixtures__/helper')
const Handler = require('../lib/handler')
const Configuration = require('../lib/configuration')
Configuration.DEFAULTS.approvals = 0

test('handleStale calls search.issues only when settings exists for days', async () => {
  // setup context with no added configuration.
  let context = mockContext('title')
  const expectMockCalls = async (config, expected) => {
    mockConfigWithContext(context, config)
    await Handler.handleStale(context)
    expect(context.github.search.issues.mock.calls.length).toBe(expected)
    context.github.search.issues.mockClear()
  }

  context.github.search = {
    issues: jest.fn().mockReturnValue({
      data: { items: [] }
    })
  }

  await Handler.handleStale(context)
  expect(context.github.search.issues.mock.calls.length).toBe(0)
  context.github.search.issues.mockClear()

  // setup context with PR configuration.
  await expectMockCalls(`
    mergeable:
      pull_requests:
        stale:
          days: 10
  `, 1)

  // setup context with issues configuration.
  await expectMockCalls(`
    mergeable:
      issues:
        stale:
          days: 10
  `, 1)

  // setup context with both issues and pr configuration.
  await expectMockCalls(`
    mergeable:
      issues:
        stale:
          days: 10
      pull_requests:
        stale:
          days: 10
  `, 2)
})

test('handlePullRequest when it is mergeable', async () => {
  let context = mockContext('title')
  await expectSuccessStatus(context)
})

test('handlePullRequest when it is NOT mergeable', async () => {
  let context = mockContext('wip')

  Handler.handlePullRequest(context).then(() => {
    expect(context.repo).toHaveBeenLastCalledWith(
      expect.objectContaining(Helper.expectedStatus('failure', 'Title contains "wip|dnm|exp|poc"'))
    )
  })
})

test('handle creates pending status', async () => {
  let context = mockContext()

  await Handler.handlePullRequest(context).then(() => {
    expect(context.repo).toBeCalledWith(
      expect.objectContaining({status: 'in_progress'})
    )
  })
})

test('one exclude configuration will exclude the validation', async () => {
  let context = Helper.mockContext({ title: 'wip', body: 'body' })
  context.repo = mockRepo()

  mockConfigWithContext(context, `
    mergeable:
      approvals: 0
      exclude: 'title'
  `)

  await expectSuccessStatus(context)
})

test('more than one exclude configuration will exclude the validation', async () => {
  let context = Helper.mockContext({ title: 'wip', label: ['proof of concept'], body: 'body' })
  context.repo = mockRepo()

  mockConfigWithContext(context, `
    mergeable:
      exclude: 'approvals, title, label'
  `)

  await expectSuccessStatus(context)
})

// TODO add tests for handleIssues

const expectSuccessStatus = async (context) => {
  await Handler.handlePullRequest(context)
    .then(() => {
      expect(context.repo).lastCalledWith(
        expect.objectContaining(Helper.expectedStatus('success', 'Okay to merge.'))
      )
    })
}

const mockConfigWithContext = (context, configString) => {
  context.github.repos.getContent = () => {
    return Promise.resolve({ data: {
      content: Buffer.from(configString).toString('base64') }
    })
  }
}

const mockContext = (title) => {
  let context = Helper.mockContext({ title: title, body: 'body' })
  context.repo = mockRepo()
  return context
}

const mockRepo = () => {
  return jest.fn((arg) => {
    if (!arg) return { owner: 'owner', repo: 'repo' }
  })
}
