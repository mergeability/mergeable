const { Action } = require('../../../lib/actions/action')
const Helper = require('../../../__fixtures__/unit/helper')

describe('Action#isEventSupported', () => {
  let action = new Action()

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
  let action = new Action()

  test('Returns an item when there is no validation defined', () => {
    let schedulerResult = {
      validationSuites: []
    }

    expect(action.getActionables(
      Helper.mockContext({ event: 'schedule' }),
      schedulerResult).length
    ).toBe(1)
  })

  test('Returns correct items when there is validation and the event is schedule', () => {
    let schedulerResult = {
      validationSuites: [{ status: {} }]
    }

    expect(action.getActionables(
      Helper.mockContext({ event: 'schedule' }),
      schedulerResult).length
    ).toBe(1)

    schedulerResult = {
      validationSuites: [{
        schedule: {
          issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
          pulls: []
        }
      }]
    }
    expect(action.getActionables(
      Helper.mockContext({event: 'schedule'}),
      schedulerResult).length
    ).toBe(3)
  })

  test('when event is not schedule', () => {
    let schedulerResult = {
      validationSuites: [{status: {}}]
    }

    expect(action.getActionables(
      Helper.mockContext(),
      schedulerResult).length
    ).toBe(1)
  })
})
