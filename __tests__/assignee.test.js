const Helper = require('../__fixtures__/helper')
const assignee = require('../lib/assignee')
const Configuration = require('../lib/configuration')

test('that mergeable is false when less than minimum', async () => {
  let validation = await assignee(createMockPR(1), null, config({min: 2}))
  expect(validation.mergeable).toBe(false)
})

test('that mergeable is true when the same as minimum', async () => {
  let validation = await assignee(createMockPR(2), null, config({min: 2}))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true when greater than minimum', async () => {
  let validation = await assignee(createMockPR(3), null, config({min: 2}))
  expect(validation.mergeable).toBe(true)
})

test('that description is dynamic based on minimum', async () => {
  let validation = await assignee(createMockPR(1), null, config({min: 5}))
  expect(validation.description[0]).toBe('Assignee count is less than "5"')
})

test('that description is null when mergeable', async () => {
  let validation = await assignee(createMockPR(5), null, config({min: 5}))
  expect(validation.description).toBe(null)
})

test('checks that advance_setting min is working', async () => {
  let configuration = `
  mergeable:
    assignee:
      min: 2
  `

  let validation = await assignee(createMockPR(1), null, config({config: configuration}))
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('Assignee count is less than "2"')

  validation = await assignee(createMockPR(2), null, config({config: configuration}))
  expect(validation.mergeable).toBe(true)
})

test('checks that advance_setting max is working', async () => {
  let configuration = `
  mergeable:
    assignee:
      max: 2
  `

  let validation = await assignee(createMockPR(3), null, config({config: configuration}))
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('Assignee count is more than "2"')

  validation = await assignee(createMockPR(2), null, config({config: configuration}))
  expect(validation.mergeable).toBe(true)
})

test('checks that advance_setting message is working', async () => {
  let configuration = `
  mergeable:
    assignee:
      max:
        count: 2
        message: 'test string'
  `

  let validation = await assignee(createMockPR(3), null, config({config: configuration}))
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('test string')

  validation = await assignee(createMockPR(2), null, config({config: configuration}))
  expect(validation.mergeable).toBe(true)
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

  return Helper.mockContext({assignees: data}).payload.pull_request
}

const config = ({min, config}) => {
  if (min) {
    return (new Configuration(`
    mergeable:
      assignee: ${min}
  `)).settings
  }

  return (new Configuration(config)).settings
}
