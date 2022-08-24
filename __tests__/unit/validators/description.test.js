const Helper = require('../../../__fixtures__/unit/helper')
const Description = require('../../../lib/validators/description')

test('isMergeable is true if the PR body is not empty', async () => {
  const description = new Description()

  const settings = {
    do: 'description',
    no_empty: {
      enabled: true
    }
  }

  const descriptionValidation = await description.processValidate(createMockPR('This is a mock Description'), settings)
  expect(descriptionValidation.status).toBe('pass')
})

test('isMergeable is false if the PR body is empty', async () => {
  const description = new Description()

  const settings = {
    do: 'description',
    no_empty: {
      enabled: true
    }
  }

  let descriptionValidation = await description.processValidate(createMockPR(''), settings)
  expect(descriptionValidation.status).toBe('fail')

  descriptionValidation = await description.processValidate(createMockPR(undefined), settings)
  expect(descriptionValidation.status).toBe('fail')

  descriptionValidation = await description.processValidate(createMockPR(null), settings)
  expect(descriptionValidation.status).toBe('fail')

  descriptionValidation = await description.processValidate(createMockPR('Some Description'), settings)
  expect(descriptionValidation.status).toBe('pass')
})

test('description is correct', async () => {
  const description = new Description()

  const settings = {
    do: 'description',
    no_empty: {
      enabled: true
    }
  }

  let descriptionValidation = await description.processValidate(createMockPR(''), settings)

  expect(descriptionValidation.status).toBe('fail')
  expect(descriptionValidation.validations[0].description).toBe("The description can't be empty")

  descriptionValidation = await description.processValidate(createMockPR('Non empty Description'), settings)
  expect(descriptionValidation.validations[0].description).toBe('The description is not empty')
})

test('must_include works', async () => {
  const description = new Description()
  const settings = {
    do: 'description',
    must_include: {
      regex: 'test string',
      message: 'failed test'
    }
  }

  let descriptionValidation = await description.processValidate(createMockPR('test string included'), settings)
  expect(descriptionValidation.status).toBe('pass')

  descriptionValidation = await description.processValidate(createMockPR('Non empty Description'), settings)
  expect(descriptionValidation.status).toBe('fail')
  expect(descriptionValidation.validations[0].description).toBe('failed test')
})

test('must_exclude works', async () => {
  const description = new Description()
  const settings = {
    do: 'description',
    must_exclude: {
      regex: 'test string',
      message: 'failed test'
    }
  }

  let descriptionValidation = await description.processValidate(createMockPR('test string included'), settings)
  expect(descriptionValidation.status).toBe('fail')
  expect(descriptionValidation.validations[0].description).toBe('failed test')

  descriptionValidation = await description.processValidate(createMockPR('Non empty Description'), settings)
  expect(descriptionValidation.status).toBe('pass')
})

const createMockPR = (description) => {
  return Helper.mockContext({ body: description })
}
