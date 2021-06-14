const executor = require('../../../lib/flex/flex')
const Helper = require('../../../__fixtures__/unit/helper')
const { Action } = require('../../../lib/actions/action')
const Comment = require('../../../lib/actions/comment')

describe('Test processBeforeValidate and processAfterValidate invocations', () => {
  let context
  const registry = { validators: new Map(), actions: new Map() }
  let action

  const config = `
    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: wip|work in progress|do not merge
              message: 'a custom message'
          - do: label
            must_exclude:
              regex: wip|work in progress
  `
  const configWithMultiple = config + `
      - when: pull_request_review.submitted
        validate:
          - do: milestone
            no_empty:
              enabled: true
  `

  beforeEach(() => {
    context = Helper.mockContext()
    Helper.mockConfigWithContext(context, config)

    action = new Action()
    action.processBeforeValidate = jest.fn()
    action.processAfterValidate = jest.fn()
    action.supportedEvents = ['pull_request.opened', 'pull_request.edited', 'pull_request_review.submitted']
    registry.actions.set('checks', action)
  })

  test('when event is in configuration', async () => {
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(action.processBeforeValidate.mock.calls.length).toBe(1)
    expect(action.processAfterValidate.mock.calls.length).toBe(1)
  })

  test('when event is not in configuration', async () => {
    context.eventName = 'pull_request_review'
    context.payload.action = 'submitted'
    await executor(context, registry)
    expect(action.processBeforeValidate.mock.calls.length).toBe(0)
    expect(action.processAfterValidate.mock.calls.length).toBe(0)
  })

  test('when event is in configuration with multiple whens', async () => {
    Helper.mockConfigWithContext(context, configWithMultiple)
    context.eventName = 'pull_request_review'
    context.payload.action = 'submitted'
    await executor(context, registry)
    expect(action.processBeforeValidate.mock.calls.length).toBe(1)
    expect(action.processAfterValidate.mock.calls.length).toBe(1)
  })

  test('two whens with same events', async () => {
    const config = `
    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: wip|work in progress|do not merge
              message: 'a custom message'
          - do: label
            must_exclude:
              regex: wip|work in progress
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: wip|work in progress|do not merge
              message: 'a custom message'
          - do: label
            must_exclude:
              regex: wip|work in progress`
    Helper.mockConfigWithContext(context, config)
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(action.processBeforeValidate.mock.calls.length).toBe(2)
    expect(action.processAfterValidate.mock.calls.length).toBe(2)
  })

  test('Expect pass action to be triggered on empty validator', async () => {
    const config = `
    version: 2
    mergeable:
      - when: pull_request.opened
        name: "Greet a contributor"
        validate: []
        pass:
          - do: comment
            payload:
              body: >
                Thanks for creating a pull request! A maintainer will review your changes shortly. Please don't be discouraged if it takes a while.`

    const context = Helper.mockContext()
    const registry = { validators: new Map(), actions: new Map() }
    Helper.mockConfigWithContext(context, config)
    const commentAction = new Comment()
    commentAction.supportedEvents = ['pull_request.opened', 'pull_request.edited', 'pull_request_review.submitted']
    registry.actions.set('comment', commentAction)

    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    context.octokit.issues.createComment = jest.fn()
    await executor(context, registry)
    expect(context.octokit.issues.createComment.mock.calls.length).toBe(1)
  })

  test('Expect fail action to not be triggered on empty validator ', async () => {
    const config = `
    version: 2
    mergeable:
      - when: pull_request.opened
        name: "Greet a contributor"
        validate: []
        fail:
          - do: comment
            payload:
              body: >
                Thanks for creating a pull request! A maintainer will review your changes shortly. Please don't be discouraged if it takes a while.`
    const context = Helper.mockContext()
    const registry = { validators: new Map(), actions: new Map() }
    Helper.mockConfigWithContext(context, config)
    const commentAction = new Comment()
    commentAction.supportedEvents = ['pull_request.opened', 'pull_request.edited', 'pull_request_review.submitted']
    registry.actions.set('comment', commentAction)

    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    context.octokit.issues.createComment = jest.fn()
    await executor(context, registry)
    expect(context.octokit.issues.createComment.mock.calls.length).toBe(0)
  })

  test('processPreAction works correctly, two whens with same events but different actions', async () => {
    const config = `
    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: wip|work in progress|do not merge
              message: 'a custom message'
          - do: label
            must_exclude:
              regex: wip|work in progress
        fail:
          - do: assign
            assignees: ['test user']
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: wip|work in progress|do not merge
              message: 'a custom message'
          - do: label
            must_exclude:
              regex: wip|work in progress
        pass:
          - do: comment
            payload:
              body: 'test comment'
          `

    const registry = { validators: new Map(), actions: new Map() }
    const commentAction = new Action()
    commentAction.processBeforeValidate = jest.fn()
    commentAction.processAfterValidate = jest.fn()
    commentAction.supportedEvents = ['pull_request.opened', 'pull_request.edited', 'pull_request_review.submitted']
    registry.actions.set('comment', commentAction)

    const assignAction = new Action()
    assignAction.processBeforeValidate = jest.fn()
    assignAction.processAfterValidate = jest.fn()
    assignAction.supportedEvents = ['pull_request.opened', 'pull_request.edited', 'pull_request_review.submitted']
    registry.actions.set('assign', assignAction)

    Helper.mockConfigWithContext(context, config)
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)

    expect(commentAction.processBeforeValidate.mock.calls.length).toBe(1)
    expect(assignAction.processBeforeValidate.mock.calls.length).toBe(1)
  })
})

describe('#executor', () => {
  test('Bad YML', async () => {
    const context = Helper.mockContext()
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    Helper.mockConfigWithContext(context, `
      version: 2
        mergeable:
    when: pull_request.*
      `,
    { files: ['.github/mergeable.yml'] }
    )

    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    context.octokit.checks.create = jest.fn()
    context.octokit.checks.update = jest.fn()

    await executor(context, { validators: new Map(), actions: new Map() })
    expect(context.octokit.checks.update.mock.calls.length).toBe(0)
    expect(context.octokit.checks.create.mock.calls.length).toBe(1)

    const theCall = context.octokit.checks.create.mock.calls[0][0]
    expect(theCall.status).toBe('completed')
    expect(theCall.conclusion).toBe('cancelled')
  })

  test('One When', async () => {
    const context = Helper.mockContext('title')
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

    const registry = { validators: new Map(), actions: new Map() }
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    // test that the registry will register dynamicly.
    expect(registry.validators.get('title')).toBeDefined()
    expect(registry.validators.get('label')).toBeDefined()

    const title = {
      processValidate: jest.fn().mockReturnValue({ status: 'pass' }),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    const label = {
      processValidate: jest.fn().mockReturnValue({ status: 'pass' }),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    registry.validators.set('label', label)

    const checks = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(false)
    }
    registry.actions.set('checks', checks)

    await executor(context, registry)

    expect(title.processValidate).toHaveBeenCalledTimes(1)
    expect(label.processValidate).toHaveBeenCalledTimes(1)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(0)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(0)
  })

  test('Comma seperated events', async () => {
    const context = Helper.mockContext('title')
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

    const registry = { validators: new Map(), actions: new Map() }
    const title = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    const issueOnly = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn(event => { return (event === 'issues.opened') })
    }
    registry.validators.set('issueOnly', issueOnly)

    const checks = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn(event => { return (event === 'pull_request.opened') })
    }
    registry.actions.set('checks', checks)

    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(1)
    expect(title.isEventSupported).toHaveBeenCalledTimes(1)
    expect(issueOnly.processValidate).toHaveBeenCalledTimes(0)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(1)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(1)

    context.eventName = 'issues'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(2)
    expect(title.isEventSupported).toHaveBeenCalledTimes(2)
    expect(issueOnly.processValidate).toHaveBeenCalledTimes(1)
    expect(issueOnly.isEventSupported).toHaveBeenCalledTimes(2)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(1)
  })

  test('Multiple Whens', async () => {
    const context = Helper.mockContext('title')
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

    const registry = { validators: new Map(), actions: new Map() }
    const title = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    const label = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('label', label)
    const checks = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.actions.set('checks', checks)

    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(1)
    expect(label.processValidate).toHaveBeenCalledTimes(0)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(1)

    context.eventName = 'issues'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(2)
    expect(label.processValidate).toHaveBeenCalledTimes(1)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(2)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(2)
  })

  test('isEventInContext is working only for correct event', async () => {
    const context = Helper.mockContext('title')
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

    const registry = { validators: new Map(), actions: new Map() }
    const title = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('title', title)
    const label = {
      processValidate: jest.fn(value => Promise.resolve({ status: 'pass' })),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('label', label)
    const checks = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.actions.set('checks', checks)

    context.eventName = 'pull_request_review'
    context.payload.action = 'opened'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(0)
    expect(label.processValidate).toHaveBeenCalledTimes(0)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(0)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(0)

    context.eventName = 'pull_request'
    await executor(context, registry)
    expect(title.processValidate).toHaveBeenCalledTimes(1)
    expect(label.processValidate).toHaveBeenCalledTimes(0)
    expect(checks.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(checks.processAfterValidate).toHaveBeenCalledTimes(1)
  })

  test('Error handling', async () => {
    const registry = { validators: new Map(), actions: new Map() }
    const errorValidator = {
      processValidate: jest.fn(value => Promise.reject(new Error('Uncaught error'))),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    const passAction = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    const errorAction = {
      processBeforeValidate: jest.fn(),
      processAfterValidate: jest.fn(),
      isEventSupported: jest.fn().mockReturnValue(true)
    }
    registry.validators.set('error', errorValidator)
    registry.actions.set('pass_action', passAction)
    registry.actions.set('error_action', errorAction)

    const context = Helper.mockContext('error')
    Helper.mockConfigWithContext(context, `
      version: 2
      mergeable:
        - when: pull_request.opened
          validate:
            - do: error
          pass:
            - do: pass_action
          error:
            - do: error_action
    `)
    context.eventName = 'pull_request'
    context.payload.action = 'opened'
    await executor(context, registry)

    expect(errorAction.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(errorAction.processAfterValidate).toHaveBeenCalledTimes(1)
    expect(passAction.processBeforeValidate).toHaveBeenCalledTimes(1)
    expect(passAction.processAfterValidate).toHaveBeenCalledTimes(0)
  })
})
