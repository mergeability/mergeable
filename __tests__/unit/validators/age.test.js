const Age = require('../../../lib/validators/age')
const Helper = require('../../../__fixtures__/unit/helper')
const moment = require('moment-timezone')

describe('age validator', () => {
  test('checks that days is validated properly', async () => {
    const age = new Age()
    const settings = {
      do: 'age',
      created_at: {
        days: 1
      }
    }

    let createdAt = moment().subtract(1, 'hours')
    let context = mockContext({ createdAt: createdAt.toISOString() })

    let timeValidation = await age.processValidate(context, settings)
    expect(timeValidation.status).toBe('fail')

    createdAt = moment().subtract(2, 'days')
    context = mockContext({ createdAt: createdAt.toISOString() })

    timeValidation = await age.processValidate(context, settings)
    expect(timeValidation.status).toBe('pass')
  })

  test('that updated_at option is working', async () => {
    const age = new Age()
    const settings = {
      do: 'age',
      updated_at: {
        days: 1
      }
    }

    const createdAt = moment().subtract(3, 'days')
    let updatedAt = moment().subtract(1, 'hours')
    let context = mockContext({ createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() })

    let timeValidation = await age.processValidate(context, settings)

    expect(timeValidation.status).toBe('fail')

    updatedAt = moment().subtract(2, 'days')
    context = mockContext({ createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() })

    timeValidation = await age.processValidate(context, settings)
    expect(timeValidation.status).toBe('pass')
  })

  test('that message option works properly', async () => {
    const age = new Age()
    const settings = {
      do: 'age',
      created_at: {
        days: 1,
        message: 'You need to wait at least one day before you can merge the PR'
      }
    }

    const createdAt = moment().subtract(1, 'hours')
    const context = mockContext({ createdAt: createdAt.toISOString() })

    const timeValidation = await age.processValidate(context, settings)
    expect(timeValidation.status).toBe('fail')
    expect(timeValidation.validations[0].description).toBe('You need to wait at least one day before you can merge the PR')
  })
})

const mockContext = (options) => {
  return Helper.mockContext(options)
}
