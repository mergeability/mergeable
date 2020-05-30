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

describe('Validator#validateSetting', () => {
  let validator = new Validator('test')

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
      validator.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('validator/test: second is expected to be of type: number')
    }

    settingToValidate = {
      first: 'Test',
      second: 32
    }
    validator.validateSettings(supportedSettings, settingToValidate)
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
      validator.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('validator/test: second option is not supported')
    }

    supportedSettings = {
      first: 'string',
      second: 'number'
    }
    validator.validateSettings(supportedSettings, settingToValidate)
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
      validator.validateSettings(supportedSettings, settingToValidate)
    } catch (err) {
      expect(err.message).toBe('validator/test: second.test option is not supported')
    }

    settingToValidate = {
      first: 'Test',
      second: {
        third: 32
      }
    }
    validator.validateSettings(supportedSettings, settingToValidate)
  })

  test('multiple settings type work', () => {
    let supportedSettings = {
      first: ['string', 'array']
    }
    let settingToValidate = {
      first: 'Test'
    }

    validator.validateSettings(supportedSettings, settingToValidate)

    settingToValidate = {
      first: [32]
    }
    validator.validateSettings(supportedSettings, settingToValidate)
  })
})
