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
  expect(descriptionValidation.description).toBe(`Description on the pull request should not be empty`)

  descriptionValidation = await description(createMockPR('Non empty Description'), null, config.settings)
  expect(descriptionValidation.description).toBe(null)
})

const createMockPR = (description) => {
  return Helper.mockContext({ body: description }).payload.pull_request
}
