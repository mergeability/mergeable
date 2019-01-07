const Helper = require('../../__fixtures__/helper')
const Dependent = require('../../lib/validators/dependent')

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

test('that mergeable is true if one of the dependent file is added', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.validate(
    createMockContext([
      { filename: 'package.json', status: 'added' },
      { filename: 'yarn.lock', status: 'modified' }
    ]),
    settings
  )
  expect(validation.status).toBe('pass')
})

test('that mergeable is false when only one of the dependent file is added', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.validate(
    createMockContext([{ filename: 'package.json', status: 'added' }]),
      settings
  )
  expect(validation.status).toBe('fail')
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

  let defaultMessage = 'One or two files (yarn.lock) is missing from your pull request because they are dependent on the following: package.json'

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
