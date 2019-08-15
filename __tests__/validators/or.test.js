const Or = require('../../lib/validators/or')
const Helper = require('../../__fixtures__/helper')

test('should run subtasks', async () => {
  const or = new Or()
  const settings = {
    do: 'or',
    validate: [
      {
        do: 'milestone',
        must_include: {
          regex: 'Version 2'
        }
      }
    ]
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('fail')
})

test('should return output of second task if first fails', async () => {
  const or = new Or()
  const settings = {
    do: 'or',
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
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('pass')
})

test('should return output of first task to pass when multiple are given', async() => {
  const or = new Or()
  const settings = {
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
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('pass')
})

test('Error is returned when validate is missing', async() => {
  const or = new Or()
  const settings = {
    do: 'or'
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('error')
})

test('Error is returned when validate is not an array', async() => {
  const or = new Or()
  const settings = {
    do: 'or',
    validate: ''
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('error')
})

test('Error is returned when validate is empty', async() => {
  const or = new Or()
  const settings = {
    do: 'or',
    validate: []
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('error')
})

test('Error is returned when validate uses unsupported classes', async() => {
  const or = new Or()
  const settings = {
    do: 'or',
    validate: [
      { do: 'missing' }
    ]
  }
  let validation = await or.validate(createMockContext({title: 'Version 1'}), settings)
  expect(validation.status).toBe('error')
})

const createMockContext = (milestone, body, deepValidation) => {
  return Helper.mockContext({milestone, body, deepValidation})
}
