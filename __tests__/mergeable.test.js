const { Mergeable, processValidations } = require('../lib/mergeable')
const Helper = require('../__fixtures__/helper')

describe('Mergeable', () => {
  test('starting in dev mode and genesised correctly', async () => {
    let mergeable = startMergeable('development')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 2 })
    expect(mergeable.genesis).toBeCalledWith(mockRobot)
    expect(mergeable.flex).toHaveBeenCalledTimes(0)
  })

  test('starting in dev mode and flexed correctly', async () => {
    let mergeable = startMergeable('development', 'flex')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 2 })
    expect(mergeable.flex).toBeCalledWith(mockRobot)
    expect(mergeable.genesis).toHaveBeenCalledTimes(0)
  })

  test('starting in production mode and genesised correctly', async () => {
    let mergeable = startMergeable('production')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 1000 })
    expect(mergeable.genesis).toBeCalledWith(mockRobot)
    expect(mergeable.flex).toHaveBeenCalledTimes(0)
  })

  test('starting in production mode and flexed correctly', async () => {
    let mergeable = startMergeable('production', 'flex')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 1000 })
    expect(mergeable.flex).toBeCalledWith(mockRobot)
    expect(mergeable.genesis).toHaveBeenCalledTimes(0)
  })
})

describe('#processValidations', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = 'flex'
  })

  test('One When', async () => {
    let context = Helper.mockContext('title')
    Helper.mockConfigWithContext(context, `
      version: 2
      mergeable:
        - when: pull_request.*
          validate:
            - do: title
              must_include:
                regex: wip|work in progress|do not merge
                message: 'a custom message'
            - do: label
              must_include:
                regex: wip|work in progress
          pass:
          fail:
    `)

    let registry = { validators: new Map(), actions: new Map() }
    context.event = 'pull_request'
    context.payload.action = 'opened'

    await processValidations(context, registry)
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
    await processValidations(context, registry)

    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(1)
  })

  test('Comma seperated events', async () => {
    let context = Helper.mockContext('title')
    Helper.mockConfigWithContext(context, `
      version: 2
      mergeable:
        - when: pull_request.opened, issues.opened
          validate:
            - do: title
              must_include:
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
    await processValidations(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(title.isEventSupported).toHaveBeenCalledTimes(1)
    expect(issueOnly.validate).toHaveBeenCalledTimes(0)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(1)

    context.event = 'issues'
    context.payload.action = 'opened'
    await processValidations(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(title.isEventSupported).toHaveBeenCalledTimes(2)
    expect(issueOnly.validate).toHaveBeenCalledTimes(1)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(2)
  })

  test('Multiple Whens', async () => {
    let context = Helper.mockContext('title')
    Helper.mockConfigWithContext(context, `
      version: 2
      mergeable:
        - when: pull_request.opened
          validate:
            - do: title
              must_exclude:
                regex: 'wip'
          pass:
          fail:
        - when: issues.opened
          validate:
            - do: label
              must_exclude:
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
    await processValidations(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(0)

    context.event = 'issues'
    await processValidations(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(label.validate).toHaveBeenCalledTimes(1)
  })
})

const startMergeable = (mode, version) => {
  let mergeable = new Mergeable(mode, version)
  mergeable.schedule = jest.fn()
  mergeable.flex = jest.fn()
  mergeable.genesis = jest.fn()
  mergeable.start(mockRobot)
  return mergeable
}

const mockRobot = {
  on: jest.fn(),
  log: {
    warn: jest.fn(),
    info: jest.fn()
  }
}
