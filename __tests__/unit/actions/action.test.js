const { Action } = require('../../../lib/actions/action')
const Helper = require('../../../__fixtures__/unit/helper')

describe('Action#isEventSupported', () => {
  const action = new Action()

  test('Returns correctly with one supported event', () => {
    action.supportedEvents = ['issues.opened']
    expect(action.isEventSupported('pull_request.opened')).toBe(false)
    expect(action.isEventSupported('issues.opened')).toBe(true)
  })

  test('Returns correctly with more than one supported event', () => {
    action.supportedEvents = ['issues.opened', 'pull_request.opened']
    expect(action.isEventSupported('pull_request.labeled')).toBe(false)
    expect(action.isEventSupported('issues.opened')).toBe(true)
    expect(action.isEventSupported('pull_request.opened')).toBe(true)
  })

  test('Returns correctly with a wildcard in the event name', () => {
    action.supportedEvents = ['issues.opened', 'pull_request.*']
    expect(action.isEventSupported('pull_request.labeled')).toBe(true)
    expect(action.isEventSupported('issues.milestoned')).toBe(false)
  })
})

describe('Action#getActionables', () => {
  const action = new Action()

  test('Returns an item when there is no validation defined', () => {
    const schedulerResult = {
      validationSuites: []
    }

    expect(action.getActionables(
      Helper.mockContext({ eventName: 'schedule' }),
      schedulerResult).length
    ).toBe(1)
  })

  test('Returns correct items when there is validation and the event is schedule', () => {
    let schedulerResult = {
      validationSuites: [{ status: {} }]
    }

    expect(action.getActionables(
      Helper.mockContext({ eventName: 'schedule' }),
      schedulerResult).length
    ).toBe(1)

    schedulerResult = {
      validationSuites: [{
        schedule: {
          issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
          pulls: []
        }
      }]
    }
    expect(action.getActionables(
      Helper.mockContext({ eventName: 'schedule' }),
      schedulerResult).length
    ).toBe(3)
  })

  test('when event is not schedule', () => {
    const schedulerResult = {
      validationSuites: [{ status: {} }]
    }

    expect(action.getActionables(
      Helper.mockContext(),
      schedulerResult).length
    ).toBe(1)
  })
})

describe('Action#getEventAttributes', () => {
  const action = new Action()

  test('Extracts event properties from pull_request correctly', () => {
    const evt = action.getEventAttributes(Helper.mockContext({ eventName: 'pull_request' }))

    expect(evt.action).toBe('opened')
    expect(evt.repository.full_name).toBe('fullRepoName')
    expect(evt.sender.login).toBe('initiator')
  })

  test('Extracts event properties from issues correctly', () => {
    const evt = action.getEventAttributes(Helper.mockContext({ eventName: 'issues' }))

    expect(evt.action).toBe('opened')
    expect(evt.repository.full_name).toBe('fullRepoName')
    expect(evt.sender.login).toBe('initiator')
  })

  test('Defaults event properties on schedule event', () => {
    const evt = action.getEventAttributes(Helper.mockContext({ eventName: 'schedule' }))

    expect(evt.action).toBe('')
    expect(evt.repository).toEqual({})
    expect(evt.sender).toEqual({})
  })
})
