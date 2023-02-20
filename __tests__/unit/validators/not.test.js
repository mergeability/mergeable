const Not = require('../../../lib/validators/not')
const Helper = require('../../../__fixtures__/unit/helper')

describe('Not Validator Unit Test', () => {
  let registry = { validators: new Map(), actions: new Map() }

  beforeEach(() => {
    registry = { validators: new Map(), actions: new Map() }
  })

  test('Should pass if subtask fails', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      validate: [
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 2'
          }
        }
      ]
    }
    const validation = await not.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('pass')
  })

  test('Should fail if subtask passes', async () => {
    const and = new Not()
    const settings = {
      do: 'not',
      validate: [
        {
          do: 'milestone',
          must_include: {
            regex: 'Version 2'
          }
        }
      ]
    }
    const validation = await and.processValidate(createMockContext({ title: 'Version 2' }), settings, registry)
    expect(validation.status).toBe('fail')
  })

  test('Error is returned when validate has more than one item', async () => {
    const and = new Not()
    const settings = {
      do: 'not',
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
    const validation = await and.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate is missing', async () => {
    const and = new Not()
    const settings = {
      do: 'not'
    }
    const validation = await and.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate is not an array', async () => {
    const and = new Not()
    const settings = {
      do: 'not',
      validate: ''
    }
    const validation = await and.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate is empty', async () => {
    const and = new Not()
    const settings = {
      do: 'and',
      validate: []
    }
    const validation = await and.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error is returned when validate uses unsupported classes', async () => {
    const and = new Not()
    const settings = {
      do: 'and',
      validate: [
        { do: 'missing' }
      ]
    }
    const validation = await and.processValidate(createMockContext({ title: 'Version 1' }), settings, registry)
    expect(validation.status).toBe('error')
  })

  test('Error if the sub validator errored', async () => {
    const and = new Not()
    const settings = {
      do: 'and',
      validate: [
        {
          do: 'and',
          validate: [
            {
              do: 'milestone',
              // invalid syntax => error
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

    const validation = await and.processValidate(createMockContext({ title: 'Version 2' }), settings, registry)
    expect(validation.status).toBe('error')
  })
})

const createMockContext = (milestone, body, deepValidation) => {
  return Helper.mockContext({ milestone, body, deepValidation })
}
