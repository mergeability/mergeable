const executor = require('../lib/flex')
const Helper = require('../__fixtures__/helper')

describe('#executor', () => {
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
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
          fail:
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
    `)

    let registry = { validators: new Map(), actions: new Map() }
    context.event = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    // test that the registry will register dynamicly.
    expect(registry.validators.get('title')).toBeDefined()
    expect(registry.validators.get('label')).toBeDefined()

    let title = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    let label = {
      validate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    registry.validators.set('label', label)

    let checks = {
      beforeValidate: jest.fn(),
      afterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(false)
    }
    registry.actions.set('checks', checks)

    await executor(context, registry)

    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(1)
    expect(checks.beforeValidate).toHaveBeenCalledTimes(0)
    expect(checks.afterValidate).toHaveBeenCalledTimes(0)
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
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
          fail:
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
    `)

    let registry = { validators: new Map(), actions: new Map() }
    let title = {
      validate: jest.fn(value => Promise.resolve(value)),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    let issueOnly = {
      validate: jest.fn(value => Promise.resolve(value)),
      isEventSupported: jest.fn(event => { return (event === 'issues.opened') })
    }
    registry.validators.set('issueOnly', issueOnly)

    let checks = {
      beforeValidate: jest.fn(),
      afterValidate: jest.fn(),
      isEventSupported: jest.fn(event => { return (event === 'pull_request.opened') })
    }
    registry.actions.set('checks', checks)

    context.event = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(title.isEventSupported).toHaveBeenCalledTimes(1)
    expect(issueOnly.validate).toHaveBeenCalledTimes(0)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(1)
    expect(checks.beforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.afterValidate).toHaveBeenCalledTimes(1)

    context.event = 'issues'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(title.isEventSupported).toHaveBeenCalledTimes(2)
    expect(issueOnly.validate).toHaveBeenCalledTimes(1)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(2)
    expect(checks.beforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.afterValidate).toHaveBeenCalledTimes(1)
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
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
          fail:
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
        - when: issues.opened
          validate:
            - do: label
              must_exclude:
                regex: 'wip'
            - do: title
          pass:
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
          fail:
            - do: checks
              status: success
              payload:
                title: Success!!
                summary: You are ready to merge
    `)

    let registry = { validators: new Map(), actions: new Map() }
    let title = {
      validate: jest.fn(value => Promise.resolve(value)),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    let label = {
      validate: jest.fn(value => Promise.resolve(value)),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('label', label)
    let checks = {
      beforeValidate: jest.fn(),
      afterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.actions.set('checks', checks)

    context.event = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(1)
    expect(label.validate).toHaveBeenCalledTimes(0)
    expect(checks.beforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.afterValidate).toHaveBeenCalledTimes(1)

    context.event = 'issues'
    await executor(context, registry)
    expect(title.validate).toHaveBeenCalledTimes(2)
    expect(label.validate).toHaveBeenCalledTimes(1)
    expect(checks.beforeValidate).toHaveBeenCalledTimes(2)
    expect(checks.afterValidate).toHaveBeenCalledTimes(2)
  })
})
