const Helper = require('../__fixtures__/helper')
const description = require('../lib/description')
const Configuration = require('../lib/configuration')

test('isMergeable is true if the PR body is not empty', async () => {
  let config = new Configuration()

  let descriptionValidation = await description(createMockPR('This is a mock Description'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(true)
})

test('isMergeable is false if the PR body is empty', async () => {
  let config = new Configuration()

  let descriptionValidation = await description(createMockPR(''), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(false)

  descriptionValidation = await description(createMockPR('Some Description'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let descriptionValidation = await description(createMockPR(''), null, config.settings)

  expect(descriptionValidation.mergeable).toBe(false)
  expect(descriptionValidation.description[0]).toBe("The Description can't be empty")

  descriptionValidation = await description(createMockPR('Non empty Description'), null, config.settings)
  expect(descriptionValidation.description).toBe(null)
})

test('must_include works', async () => {
  let config = new Configuration(`
    mergeable:
      description:
        must_include:
          regex: 'test string'
          message: 'failed test'
  `)
  let descriptionValidation = await description(createMockPR('test string included'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(true)

  descriptionValidation = await description(createMockPR('Non empty Description'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(false)
  expect(descriptionValidation.description[0]).toBe('failed test')
})

test('must_exclude works', async () => {
  let config = new Configuration(`
    mergeable:
      description:
        must_exclude:
          regex: 'test string'
          message: 'failed test'
  `)
  let descriptionValidation = await description(createMockPR('test string included'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(false)
  expect(descriptionValidation.description[0]).toBe('failed test')

  descriptionValidation = await description(createMockPR('Non empty Description'), null, config.settings)
  expect(descriptionValidation.mergeable).toBe(true)
})

const createMockPR = (description) => {
  return Helper.mockContext({ body: description }).payload.pull_request
}
