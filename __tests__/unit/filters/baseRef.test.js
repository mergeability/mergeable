const BaseRef = require('../../../lib/filters/baseRef')
const Helper = require('../../../__fixtures__/unit/helper')

test('should fail with unexpected baseRef', async () => {
  const baseRef = new BaseRef()
  const settings = {
    do: 'baseRef',
    must_include: {
      regex: 'some-other-ref'
    }
  }
  const filter = await baseRef.processFilter(createMockContext('some-ref'), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with expected baseRef', async () => {
  const baseRef = new BaseRef()
  const settings = {
    do: 'baseRef',
    must_include: {
      regex: 'some-ref'
    }
  }
  const filter = await baseRef.processFilter(createMockContext('some-ref'), settings)
  expect(filter.status).toBe('pass')
})

test('should fail with excluded baseRef', async () => {
  const baseRef = new BaseRef()
  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'some-ref'
    }
  }
  const filter = await baseRef.processFilter(createMockContext('some-ref'), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with excluded baseRef', async () => {
  const baseRef = new BaseRef()
  const settings = {
    do: 'baseRef',
    must_exclude: {
      regex: 'some-other-ref'
    }
  }
  const filter = await baseRef.processFilter(createMockContext('some-ref'), settings)
  expect(filter.status).toBe('pass')
})

const createMockContext = (baseRef) => {
  return Helper.mockContext({ baseRef })
}
