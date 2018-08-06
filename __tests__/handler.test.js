const Helper = require('../__fixtures__/helper')
const Handler = require('../lib/handler')
const Configuration = require('../lib/configuration')
Configuration.DEFAULTS.approvals = 0

describe('#handleFlex', ()=> {
  beforeEach(()=> {
    process.env.MERGEABLE_VERSION = 'flex'
  })

  test('One When', async ()=> {
    let context = mockContext('title')
    mockConfigWithContext(context, `
      version: flex
      mergeable:
        - when: pull_request.*
          validate:
            - do: title
              regex: wip|work in progress|do not merge
              message: 'a custom message'
            - do: label
              regex: wip|work in progress
          pass:
          fail:
    `)

    let registry = { validators: new Map(), actions: new Map() }
    context.event = 'pull_request'
    context.payload.action = 'opened'

    await Handler.handleFlex(context, registry)
    // test that the registry will register dynamicly.
    expect(registry.validators.get('title')).toBeDefined()
    expect(registry.validators.get('label')).toBeDefined()

    let title = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    let label = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('label', label)

    registry.validators.set('title', title)
    registry.validators.set('label', label)
    await Handler.handleFlex(context, registry)

    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(1)

  })

  test('Comma seperated events', async ()=> {
    let context = mockContext('title')
    mockConfigWithContext(context, `
      version: flex
      mergeable:
        - when: pull_request.opened, issues.opened
          validate:
            - do: title
              regex: wip|work in progress|do not merge
            - do: issueOnly
          pass:
          fail:
    `)

    let registry = { validators: new Map() }
    let title = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    let issueOnly = {
      validate: jest.fn(),
      isEventSupported: jest.fn(event => { return (event === 'issues.opened') })
    }
    registry.validators.set('issueOnly', issueOnly)

    context.event = 'pull_request'
    context.payload.action = 'opened'
    await Handler.handleFlex(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(title.isEventSupported).toHaveBeenCalledTimes(1)
    expect(issueOnly.validate).toHaveBeenCalledTimes(0)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(1)

    context.event = 'issues'
    context.payload.action = 'opened'
    await Handler.handleFlex(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(title.isEventSupported).toHaveBeenCalledTimes(2)
    expect(issueOnly.validate).toHaveBeenCalledTimes(1)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(2)

  })

  test('Multiple Whens', async ()=> {
    let context = mockContext('title')
    mockConfigWithContext(context, `
      version: flex
      mergeable:
        - when: pull_request.opened
          validate:
            - do: title
              regex: 'wip'
          pass:
          fail:
        - when: issues.opened
          validate:
            - do: label
              regex: 'wip'
            - do: title
          pass:
          fail:
    `)

    let registry = { validators: new Map() }
    let title = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    let label = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('label', label)

    context.event = 'pull_request'
    context.payload.action = 'opened'
    await Handler.handleFlex(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(0)

    context.event = 'issues'
    await Handler.handleFlex(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(label.validate).toHaveBeenCalledTimes(1)

  })
})

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

  await Handler.handlePullRequest(context).then(() => {
    let expected = Helper.expectedStatus('failure')
    delete expected.output.summary
    expect(context.repo).toHaveBeenLastCalledWith(
      expect.objectContaining(Helper.expectedStatus('failure', '## Mergeable has found the following failed checks\n - Title contains "wip|dnm|exp|poc"\n ___ \n **Please address the problems found above!**'))
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
