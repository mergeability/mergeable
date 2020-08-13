const { Validator } = require('../../../lib/validators/validator')

describe('Validator#isEventSupported', () => {
  let validator = new Validator()

  test('Returns correctly with one supported event', () => {
    validator.supportedEvents = ['issues.opened']
    expect(validator.isEventSupported('pull_request.opened')).toBe(false)
    expect(validator.isEventSupported('issues.opened')).toBe(true)
  })

  test('Returns correctly with more than one supported event', () => {
    validator.supportedEvents = ['issues.opened', 'pull_request.opened']
    expect(validator.isEventSupported('pull_request.labeled')).toBe(false)
    expect(validator.isEventSupported('issues.opened')).toBe(true)
    expect(validator.isEventSupported('pull_request.opened')).toBe(true)
  })

  test('Returns correctly with a wildcard in the event name', () => {
    validator.supportedEvents = ['issues.opened', 'pull_request.*']
    expect(validator.isEventSupported('pull_request.labeled')).toBe(true)
    expect(validator.isEventSupported('issues.milestoned')).toBe(false)
  })
})
