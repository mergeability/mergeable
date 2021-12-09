const BaseRef = require('../../../lib/validators/baseRef')
const Helper = require('../../../__fixtures__/unit/helper')

test('validateCheckSuite called for check_suite events', async () => {
  // GIVEN
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef'
  }

  const returnValue = {}
  baseRef.validateCheckSuite = jest.fn()
  baseRef.validateCheckSuite.mockReturnValueOnce(returnValue)

  // WHEN
  const output = await baseRef.processValidate(mockCheckSuiteContext(['foo']), settings)

  // THEN
  expect(output).toBe(returnValue)
})

test('validateStatus called for status events', async () => {
  // GIVEN
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef'
  }

  const returnValue = {}
  baseRef.validateStatus = jest.fn()
  baseRef.validateStatus.mockReturnValueOnce(returnValue)

  // WHEN
  const output = await baseRef.processValidate(mockStatusContext(['foo']), settings)

  // THEN
  expect(output).toBe(returnValue)
})

test('processOptions called for non-check-suite non-status events', async () => {
  // GIVEN
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef'
  }

  const returnValue = {}
  baseRef.processOptions = jest.fn()
  baseRef.processOptions.mockReturnValueOnce(returnValue)

  // WHEN
  const output = await baseRef.processValidate(mockContext('foo'), settings)

  // THEN
  expect(output).toBe(returnValue)
})

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

test('fail when exclude regex is in baseRef of single pull request related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockStatusContext(['WIP foo'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('fail when exclude regex is in one baseRef of multiple pull requests related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockStatusContext(['foo', 'WIP bar', 'baz'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('pass when exclude regex is not in any baseRef of multiple pull requests related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = mockStatusContext(['foo', 'bar', 'baz'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('pass')
})

test('fail when include regex exists and there are no pull requests related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_include: {
      regex: 'foo'
    }
  }

  const context = mockStatusContext([])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')
})

test('pass when exclude regex is only in baseRef of a closed pull request related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    }
  }

  const context = Helper.mockContext({ eventName: 'status' })
  const pulls = {
    data: [
      { state: 'open', base: { ref: 'foo' } },
      { state: 'closed', base: { ref: 'wip bar' } }
    ]
  }
  context.octokit.request = jest.fn()
  context.octokit.request.mockReturnValueOnce(pulls)

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('pass')
})

test('fail with mediaType when exclude regex is in baseRef of single pull request related to status', async () => {
  const baseRef = new BaseRef()

  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'wip'
    },
    mediaType: {
      previews: ['groot']
    }
  }

  const context = mockStatusContext(['WIP foo'])

  const baseRefValidation = await baseRef.processValidate(context, settings)
  expect(baseRefValidation.status).toBe('fail')

  expect(context.octokit.request.mock.calls[0][1].mediaType.previews[0]).toBe('groot')
})

const mockCheckSuiteContext = baseRefs => {
  const context = Helper.mockContext({ eventName: 'check_suite' })
  context.payload.check_suite.pull_requests = baseRefs.map(baseRef => ({ base: { ref: baseRef } }))
  return context
}

const mockStatusContext = baseRefs => {
  const context = Helper.mockContext({ eventName: 'status' })
  const pulls = {
    data: baseRefs.map(baseRef => ({ state: 'open', base: { ref: baseRef } }))
  }

  context.octokit.request = jest.fn()
  context.octokit.request.mockReturnValueOnce(pulls)

  return context
}
