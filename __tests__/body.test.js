const Helper = require('../__fixtures__/helper')
const body = require('../lib/body')
const Configuration = require('../lib/configuration')

test('isMergeable is true if the PR body is not empty', async () => {
  let config = new Configuration()

  let bodyValidation = await body(createMockPR('This is a mock Description'), null, config.settings)
  expect(bodyValidation.mergeable).toBe(true)
})

test('isMergeable is false if the PR body is empty', async () => {
  let config = new Configuration()

  let bodyValidation = await body(createMockPR(''), null, config.settings)
  expect(bodyValidation.mergeable).toBe(false)

  bodyValidation = await body(createMockPR('Some Description'), null, config.settings)
  expect(bodyValidation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let bodyValidation = await body(createMockPR(''), null, config.settings)

  expect(bodyValidation.mergeable).toBe(false)
  expect(bodyValidation.description).toBe(`Description on the pull request should not be empty`)

  bodyValidation = await body(createMockPR('Non empty Description'), null, config.settings)
  expect(bodyValidation.description).toBe(null)
})

const createMockPR = (body) => {
  return Helper.mockContext({ body: body }).payload.pull_request
}
