const { Filter } = require('../../../lib/filters/filter')

describe('Filter#isEventSupported', () => {
  let filter = new Filter()

  test('Returns correctly with one supported event', () => {
    filter.supportedEvents = ['issues.opened']
    expect(filter.isEventSupported('pull_request.opened')).toBe(false)
    expect(filter.isEventSupported('issues.opened')).toBe(true)
  })

  test('Returns correctly with more than one supported event', () => {
    filter.supportedEvents = ['issues.opened', 'pull_request.opened']
    expect(filter.isEventSupported('pull_request.labeled')).toBe(false)
    expect(filter.isEventSupported('issues.opened')).toBe(true)
    expect(filter.isEventSupported('pull_request.opened')).toBe(true)
  })

  test('Returns correctly with a wildcard in the event name', () => {
    filter.supportedEvents = ['issues.opened', 'pull_request.*']
    expect(filter.isEventSupported('pull_request.labeled')).toBe(true)
    expect(filter.isEventSupported('issues.milestoned')).toBe(false)
  })
})

describe('Filter#validateSetting', () => {
  let filter = new Filter('test')

  test('throw error if the type mismatch', () => {
    const supportedSettings = {
      first: 'string',
      second: 'number',
      third: 'array'
    }
    let settingToValidate = {
      first: 'Test',
      second: '32',
      third: [2, 3]
    }

    try {
      filter.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('filter/test: second is expected to be of type: number')
    }

    settingToValidate = {
      first: 'Test',
      second: 32
    }
    filter.validateSettings(supportedSettings, settingToValidate)
  })

  test('throw error if unknown type', () => {
    let supportedSettings = {
      first: 'string'
    }
    let settingToValidate = {
      first: 'Test',
      second: 32
    }

    try {
      filter.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('filter/test: second option is not supported')
    }

    supportedSettings = {
      first: 'string',
      second: 'number'
    }
    filter.validateSettings(supportedSettings, settingToValidate)
  })

  test('nested settings work', () => {
    let supportedSettings = {
      first: 'string',
      second: {
        third: 'number'
      }
    }
    let settingToValidate = {
      first: 'Test',
      second: {
        test: 32
      }
    }

    try {
      filter.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('filter/test: second.test option is not supported')
    }

    settingToValidate = {
      first: 'Test',
      second: {
        third: 32
      }
    }
    filter.validateSettings(supportedSettings, settingToValidate)
  })

  test('multiple settings type work', () => {
    let supportedSettings = {
      first: ['string', 'array']
    }
    let settingToValidate = {
      first: 'Test'
    }

    filter.validateSettings(supportedSettings, settingToValidate)

    settingToValidate = {
      first: [32]
    }
    filter.validateSettings(supportedSettings, settingToValidate)
  })
})
