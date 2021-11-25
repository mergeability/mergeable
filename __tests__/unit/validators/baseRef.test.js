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

test('checks that it passes when exclude regex is not in baseRef', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const baseRefValidation = await baseRef.processValidate(mockContext('foo'), settings)
  expect(baseRefValidation.status).toBe('pass')
})

test('checks that it passes when include regex is in baseRef', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    }
  }

  const baseRefValidation = await baseRef.processValidate(mockContext('(feat) foo'), settings)
  expect(baseRefValidation.status).toBe('pass')
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

test('fail when exclude regex is in baseRef of single check_suite pull request', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockCheckSuiteContext(['WIP foo'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('fail when exclude regex is in one baseRef of multiple check_suite pull requests', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockCheckSuiteContext(['foo', 'WIP bar', 'baz'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('pass when exclude regex is not in any baseRef of multiple check_suite pull requests', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockCheckSuiteContext(['foo', 'bar', 'baz'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('pass')
})

test('fail when include regex exists and there are no pull requests in check_suite', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_include: {
      regex: 'foo'
    }
  }

  const context = mockCheckSuiteContext([])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

const mockContext = baseRef => {
  const context = Helper.mockContext({ baseRef: baseRef })
  return context
}

const mockCheckSuiteContext = baseRefs => {
  const context = Helper.mockContext({ eventName: 'check_suite' })
  context.payload.check_suite.pull_requests = baseRefs.map(baseRef => ({ base: { ref: baseRef } }))
  return context
}
