const Helper = require('../../__fixtures__/helper')
const Dependent = require('../../lib/validators/dependent')

const mockPR = {number: 1}

test('that mergeable is true if none of the dependent file is modified', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['a.js', 'b.go']
  }

  let validation = await dependent.validate(createMockContext([]), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is true if all of the dependent file is modified', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.validate(createMockContext(['package.json', 'yarn.lock']), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is false when only some of the dependent files are modified', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.validate(createMockContext(['package.json']), settings)
  expect(validation.status).toBe('fail')
})

test('test description is correct', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let defaultMessage = `One of the following file is modified, all the other files in the list must be modified as well:
  - package.json,
  - yarn.lock`

  let validation = await dependent.validate(createMockContext(['package.json']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe(defaultMessage)
})

test('test that custom message is correct', async () => {
  const dependent = new Dependent()
  let customMessage = 'Test Message'

  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock'],
    message: customMessage
  }

  let validation = await dependent.validate(createMockContext(['package.json']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe(customMessage)
})

const createMockContext = (files) => {
  return Helper.mockContext({files: files})
}
