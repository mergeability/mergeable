const Helper = require('../../../__fixtures__/unit/helper')
const Assignee = require('../../../lib/validators/assignee')

test('that mergeable is false when less than minimum', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    min: {
      count: 2
    }
  }

  let validation = await assignee.validate(createMockPR(1), settings)
  expect(validation.status).toBe('fail')
})

test('that mergeable is true when the same as minimum', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    min: {
      count: 2
    }
  }
  let validation = await assignee.validate(createMockPR(2), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is true when greater than minimum', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    min: {
      count: 2
    }
  }
  let validation = await assignee.validate(createMockPR(3), settings)
  expect(validation.status).toBe('pass')
})

test('that description is dynamic based on minimum', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    min: {
      count: 5
    }
  }
  let validation = await assignee.validate(createMockPR(1), settings)
  expect(validation.validations[0].description).toBe('assignee count is less than "5"')
})

test('that description is correct when mergeable', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    min: {
      count: 5
    }
  }
  let validation = await assignee.validate(createMockPR(5), settings)
  expect(validation.validations[0].description).toBe("assignee does have a minimum of '5'")
})

test('checks that max is working', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    max: {
      count: 2
    }
  }

  let validation = await assignee.validate(createMockPR(3), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('assignee count is more than "2"')

  validation = await assignee.validate(createMockPR(2), settings)
  expect(validation.status).toBe('pass')
})

test('checks that advance_setting message is working', async () => {
  const assignee = new Assignee()

  const settings = {
    do: 'assignee',
    max: {
      count: 2,
      message: 'test string'
    }
  }

  let validation = await assignee.validate(createMockPR(3), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('test string')

  validation = await assignee.validate(createMockPR(2), settings)
  expect(validation.status).toBe('pass')
})

const createMockPR = (minimum, data) => {
  if (!data) {
    data = []
    for (let i = 0; i < minimum; i++) {
      data.push({
        login: `user${i}`
      })
    }
  }

  return Helper.mockContext({assignees: data})
}
