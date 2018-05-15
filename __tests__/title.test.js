const Helper = require('../__fixtures__/helper')
const title = require('../lib/title')
const Configuration = require('../lib/configuration')

test('fail gracefully if invalid setting is provided', async () => {
  // try to pass an array instead
  let config = new Configuration(`
    mergeable:
      title: ['item 1', 'item 2' ]
  `)

  let titleValidation = await title(createMockPR('Valid Title'), null, config.settings)
  expect(titleValidation.mergeable).toBe(true)
})

test('fail gracefully if invalid regex', async () => {
  let config = new Configuration(`
    mergeable:
      title: '@#$@#$@#$'
  `)
  let titleValidation = await title(createMockPR('WIP Title'), null, config.settings)
  expect(titleValidation.mergeable).toBe(true)
})

test('checks that it fail when exclude regex is in title', async () => {
  // try to pass an array instead
  let config = new Configuration(`
    mergeable:
      title: 
        must-include: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)' 
        must-exclude: 'wip'
  `)

  let titleValidation = await title(createMockPR('WIP Title'), null, config.settings)

  expect(titleValidation.mergeable).toBe(false)

  titleValidation = await title(createMockPR('(feat) WIP Title'), null, config.settings)

  expect(titleValidation.mergeable).toBe(false)
})

test('checks that it fail when include regex is in title', async () => {
  let includeList = `^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`
  let config = new Configuration(`
    mergeable:
      title: 
        must-include: ${includeList}
        must-exclude: 'wip'
  `)

  let titleValidation = await title(createMockPR('include Title'), null, config.settings)
  expect(titleValidation.mergeable).toBe(false)
  expect(titleValidation.description[0]).toBe(`Title does not contain "${includeList}"`)

  titleValidation = await title(createMockPR('(feat) WIP Title'), null, config.settings)

  expect(titleValidation.mergeable).toBe(false)
})

test('isMergeable is false if regex found or true if not', async () => {
  let config = new Configuration()

  let titleValidation = await title(createMockPR('WIP Title'), null, config.settings)
  expect(titleValidation.mergeable).toBe(false)

  titleValidation = await title(createMockPR('Some Title'), null, config.settings)
  expect(titleValidation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let titleValidation = await title(createMockPR('WIP Title'), null, config.settings)

  expect(titleValidation.mergeable).toBe(false)
  expect(titleValidation.description).toBe(`Title contains "${Configuration.DEFAULTS.title}"`)

  titleValidation = await title(createMockPR('Just Title'), null, config.settings)
  expect(titleValidation.description).toBe(null)
})

const createMockPR = (title) => {
  return Helper.mockContext({ title: title }).payload.pull_request
}
