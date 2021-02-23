const Time = require('../../../lib/validators/time')
const Helper = require('../../../__fixtures__/unit/helper')
const moment = require('moment-timezone')

describe('age option', () => {
  test('checks that seconds is validated properly', async () => {
    let time = new Time()
    const settings = {
      do: 'time',
      age: {
        seconds: 86400
      }
    }

    let createdAt = moment().subtract(1, 'hours')
    let context = mockContext({createdAt: createdAt.toISOString()})

    let timeValidation = await time.processValidate(context, settings)
    expect(timeValidation.status).toBe('fail')

    createdAt = moment().subtract(2, 'days')
    context = mockContext({createdAt: createdAt.toISOString()})

    timeValidation = await time.processValidate(context, settings)
    expect(timeValidation.status).toBe('pass')
  })

  test('that use_updated_at option is properly applied', async () => {
    let time = new Time()
    const settings = {
      do: 'time',
      age: {
        seconds: 86400,
        use_updated_at: true
      }
    }

    let createdAt = moment().subtract(3, 'days')
    let updatedAt = moment().subtract(1, 'hours')
    let context = mockContext({createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString()})

    let timeValidation = await time.processValidate(context, settings)
    expect(timeValidation.status).toBe('fail')

    updatedAt = moment().subtract(2, 'days')
    context = mockContext({createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString()})

    timeValidation = await time.processValidate(context, settings)
    expect(timeValidation.status).toBe('pass')
  })

  test('that message option works properly', async () => {
    let time = new Time()
    const settings = {
      do: 'time',
      age: {
        seconds: 86400,
        message: 'You need to wait at least one day before you can merge the PR'
      }
    }

    let createdAt = moment().subtract(1, 'hours')
    let context = mockContext({createdAt: createdAt.toISOString()})

    let timeValidation = await time.processValidate(context, settings)
    expect(timeValidation.status).toBe('fail')
    expect(timeValidation.validations[0].description).toBe('You need to wait at least one day before you can merge the PR')
  })
})

const mockContext = (options) => {
  return Helper.mockContext(options)
}
