const { Action } = require('../../../lib/actions/action')

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
