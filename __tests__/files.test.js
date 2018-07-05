const Helper = require('../__fixtures__/helper')
const files = require('../lib/files')
const Configuration = require('../lib/configuration')

const mockPR = {number: 1}

test('that mergeable is true added file have proper header', async () => {
  let fileList = {
    'test.js': `Test Header
    This is a Test File
    `
  }

  let validation = await files(mockPR, createMockContext(fileList), config())
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true if added file doesn\'t match pattern', async () => {
  let fileList = {
    'test.go': `No Header
    This is a Test File
    `
  }

  let validation = await files(mockPR, createMockContext(fileList), config())
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is false when added file doesn\'t have proper header', async () => {
  let fileList = {
    'test.js': `No Header
    This is a Test File
    `
  }

  let validation = await files(mockPR, createMockContext(fileList), config())
  expect(validation.mergeable).toBe(false)
})

test('test description is correct', async () => {
  let defaultMessage = `Following files are missing the required header:
  - test.js`

  let fileList = {
    'test.js': `No Header
    This is a Test File
    `
  }
  let validation = await files(mockPR, createMockContext(fileList), config())
  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(defaultMessage)
})

test('test that custom message is correct', async () => {
  let customMessage = 'Test Message'

  let fileList = {
    'test.js': `No Header
    This is a Test File
    `
  }

  let validation = await files(mockPR, createMockContext(fileList), config(customMessage))
  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(customMessage)
})

const createMockContext = (files) => {
  let filenames = Object.keys(files)
  return Helper.mockContext({fileContents: files, files: filenames.map(name => ({name: name, status: 'added'}))})
}

const config = (message) => {
  return (new Configuration(`
  mergeable:
    pull_request:
      files:
        header: "Test Header"
        pattern: "*.js"
        ${message ? `message: ${message}` : ``}
`)).settings.mergeable.pull_request
}
