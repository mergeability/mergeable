const Helper = require('../__fixtures__/helper')
const dependent = require('../lib/dependent')
const Configuration = require('../lib/configuration')

const mockPR = {number: 1}

test('that mergeable is true if none of the dependent file is modified', async () => {
  let validation = await dependent(mockPR, createMockContext([]), config(['package.json', 'yarn.lock']))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true if all of the dependent file is modified', async () => {
  let validation = await dependent(mockPR, createMockContext(['package.json', 'yarn.lock']), config(['package.json', 'yarn.lock']))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is false when only some of the dependent files are modified', async () => {
  let validation = await dependent(mockPR, createMockContext(['package.json']), config(['package.json', 'yarn.lock']))
  expect(validation.mergeable).toBe(false)
})

test('test description is correct', async () => {
  let defaultMessage = `One of the following file is modified, all the other files in the list must be modified as well:
  - package.json,
  - yarn.lock`
  let validation = await dependent(mockPR, createMockContext(['package.json']), config(['package.json', 'yarn.lock']))
  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(defaultMessage)
})

test('test that custom message is correct', async () => {
  let customMessage = 'Test Message'
  let validation = await dependent(mockPR, createMockContext(['package.json']), config(['package.json', 'yarn.lock'], customMessage))
  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(customMessage)
})

const createMockContext = (files) => {
  return Helper.mockContext({files: files.map(name => ({name: name, status: 'modified'}))})
}

const config = (files, message) => {
  return (new Configuration(`
  mergeable:
    pull_request:
      dependent:
        files: [${files}]
        ${message ? `message: ${message}` : ``}
`)).settings.mergeable.pull_request
}
