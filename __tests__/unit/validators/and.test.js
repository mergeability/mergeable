const And = require('../../../lib/validators/and')
const Helper = require('../../../__fixtures__/unit/helper')

describe('And Validator Unit Test', () => {
  let registry = { validators: new Map(), actions: new Map() }

  beforeEach(() => {
    registry = { validators: new Map(), actions: new Map() }
  })

  test('should run subtasks', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 2'
          }
        }
      ]
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('fail')
  })

  test('should return output of second task if first fails', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 2'
          }
        },
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 1'
          }
        }
      ]
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('fail')
  })

  test('should return output of first task to pass when multiple are given', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 1'
          }
        },
        {
          do: 'milestone',
          must_exclude: {
            regex: 'Version 2'
          }
        }
      ]
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('pass')
  })

  test('Error is returned when validate is missing', async() => {
    const and = new And()
    const settings = {
      do: 'and'
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate is not an array', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: ''
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate is empty', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: []
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate uses unsupported classes', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        { do: 'missing' }
      ]
    }
    let validation = await and.validate(createMockContext({title: 'Version 1'}), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Supports nested and validator', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'or',
          validate: [
            {
              do: 'milestone',
              must_include: {
                regex: 'Version 1'
              }
            },
            {
              do: 'milestone',
              must_include: {
                regex: 'Version 2'
              }
            }
          ]
        },
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 3'
          }
        }
      ]
    }

    let validation = await and.validate(createMockContext({title: 'Version 2'}), settings, registry)
    expect(validation.status).toBe('fail')
  })

  test('error if one of the sub validator errored', async() => {
    const and = new And()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'and',
          validate: [
            {
              do: 'milestone',
              must_inclxude: {
                regex: 'Version 1'
              }
            },
            {
              do: 'milestone',
              must_include: {
                regex: 'Version 2'
              }
            }
          ]
        },
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 3'
          }
        }
      ]
    }

    let validation = await and.validate(createMockContext({title: 'Version 2'}), settings, registry)
    expect(validation.status).toBe('error')
  })
})

const createMockContext = (milestone, body, deepValidation) => {
  return Helper.mockContext({milestone, body, deepValidation})
}
