const BaseRef = require('../../../lib/validators/baseRef')
const Helper = require('../../../__fixtures__/unit/helper')

test('fail gracefully if invalid regex', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: '@#$@#$@#$'
    }
  }

  const baseRefValidation = await baseRef.processValidate(mockContext('WIP BaseRef'), settings)
  expect(baseRefValidation.status).toBe('pass')
})

test('checks that it fail when exclude regex is in baseRef', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let baseRefValidation = await baseRef.processValidate(mockContext('WIP BaseRef'), settings)
  expect(baseRefValidation.status).toBe('fail')

  baseRefValidation = await baseRef.processValidate(mockContext('(feat) WIP BaseRef'), settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('checks that advance setting of must_include works', async () => {
  const baseRef = new BaseRef()

  const includeList = '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
  const testMessage = 'this is a test message'

  const settings = {
    do: 'baseRef',
    must_include: {
      regex: includeList,
      message: testMessage
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let baseRefValidation = await baseRef.processValidate(mockContext('include BaseRef'), settings)
  expect(baseRefValidation.status).toBe('fail')
  expect(baseRefValidation.validations[0].description).toBe(testMessage)

  baseRefValidation = await baseRef.processValidate(mockContext('(feat) WIP BaseRef'), settings)

  expect(baseRefValidation.status).toBe('fail')
})

const mockContext = baseRef => {
  const context = Helper.mockContext({ baseRef: baseRef })
  return context
}
