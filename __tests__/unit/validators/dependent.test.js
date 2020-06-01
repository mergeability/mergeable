const Helper = require('../../../__fixtures__/unit/helper')
const Dependent = require('../../../lib/validators/dependent')

describe('dependent files with modified', () => {
  test('changed file exists and files found', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        file: 'package.json',
        files: ['package-lock.json', 'yarn.lock']
      }

    }

    let validation = await dependent.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
    expect(validation.status).toBe('pass')

    // test with only requiring one dependent file.
    settings.changed.files = ['package-lock.json']
    validation = await dependent.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
    expect(validation.status).toBe('pass')
  })

  test('changed file exist and file(s) not found', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        file: 'package.json',
        files: ['package-lock.json']
      }
    }

    let validation = await dependent.processValidate(createMockContext(['package.json', 'a.js', 'b.js']), settings)
    expect(validation.status).toBe('fail')
  })

  test('modified does not exist and file(s) not found', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        file: 'package.json',
        files: ['package-lock.json']
      }
    }

    let validation = await dependent.processValidate(createMockContext(['package.json', 'a.js', 'b.js']), settings)
    expect(validation.status).toBe('fail')
  })

  test('required sub option works as alias for files', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        file: 'package.json',
        required: ['package-lock.json']
      }
    }

    let validation = await dependent.processValidate(createMockContext([]), settings)
    expect(validation.status).toBe('pass')
  })

  test('error when "file" sub option is missing', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        required: ['package-lock.json']
      }
    }

    let validation = await dependent.processValidate(createMockContext([]), settings)
    expect(validation.status).toBe('error')
    expect(validation.validations[0].description).toBe('Failed to validate because the \'file\' sub option for \'changed\' option is missing. Please check the documentation')
  })

  test('glob works with changed file option', async () => {
    const dependent = new Dependent()
    const settings = {
      do: 'dependent',
      changed: {
        file: '**/*.js',
        files: ['package-lock.json']
      }
    }

    let validation = await dependent.processValidate(createMockContext(['a.js']), settings)
    expect(validation.status).toBe('fail')

    validation = await dependent.processValidate(createMockContext(['test/test.js']), settings)
    expect(validation.status).toBe('fail')

    validation = await dependent.processValidate(createMockContext(['test/test.js', 'package-lock.json']), settings)
    expect(validation.status).toBe('pass')
  })
})

test('that mergeable is true if none of the dependent file is modified', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['a.js', 'b.go']
  }

  let validation = await dependent.processValidate(createMockContext([]), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is true if all of the dependent file is modified', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.processValidate(createMockContext(['package.json', 'yarn.lock', 'a.js']), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is true if one of the dependent file is added', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let validation = await dependent.processValidate(
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

  let validation = await dependent.processValidate(
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

  let validation = await dependent.processValidate(createMockContext(['package.json', 'a.js', 'b.js']), settings)
  expect(validation.status).toBe('fail')
})

test('test description is correct', async () => {
  const dependent = new Dependent()
  const settings = {
    do: 'dependent',
    files: ['package.json', 'yarn.lock']
  }

  let defaultMessage = 'One or more files (yarn.lock) are missing from your pull request because they are dependent on the following: package.json'

  let validation = await dependent.processValidate(createMockContext(['package.json']), settings)
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

  let validation = await dependent.processValidate(createMockContext(['package.json']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe(customMessage)
})

const createMockContext = (files) => {
  return Helper.mockContext({files: files})
}
