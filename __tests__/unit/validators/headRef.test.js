const HeadRef = require('../../../lib/validators/headRef')
const Helper = require('../../../__fixtures__/unit/helper')

test('fail gracefully if invalid regex', async () => {
  const headRef = new HeadRef()

  const settings = {
    do: 'headRef',
    must_exclude: {
      regex: '@#$@#$@#$'
    }
  }

  const headRefValidation = await headRef.processValidate(mockContext('WIP HeadRef'), settings)
  expect(headRefValidation.status).toBe('pass')
})

test('checks that it fail when exclude regex is in headRef', async () => {
  const headRef = new HeadRef()

  const settings = {
    do: 'headRef',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let headRefValidation = await headRef.processValidate(mockContext('WIP HeadRef'), settings)
  expect(headRefValidation.status).toBe('fail')

  headRefValidation = await headRef.processValidate(mockContext('(feat) WIP HeadRef'), settings)
  expect(headRefValidation.status).toBe('fail')
})

test('checks that advance setting of must_include works', async () => {
  const headRef = new HeadRef()

  const includeList = '`^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`'
  const testMessage = 'this is a test message'

  const settings = {
    do: 'headRef',
    must_include: {
      regex: includeList,
      message: testMessage
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let headRefValidation = await headRef.processValidate(mockContext('include HeadRef'), settings)
  expect(headRefValidation.status).toBe('fail')
  expect(headRefValidation.validations[0].description).toBe(testMessage)

  headRefValidation = await headRef.processValidate(mockContext('(feat) WIP HeadRef'), settings)

  expect(headRefValidation.status).toBe('fail')
})

const mockContext = headRef => {
  const context = Helper.mockContext({ headRef: headRef })
  return context
}
