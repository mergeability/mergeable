const title = require('../lib/title')
const Configuration = require('../lib/configuration')

test('fail gracefully if invalid regex', async () => {
  let config = new Configuration(`
    mergeable:
      title: '@#$@#$@#$'
  `)
  let titleValidation = await title(createMock('WIP Title'), config.settings)
  expect(titleValidation.mergeable).toBe(true)
})

test('isMergeable is false if regex found or true if not', async () => {
  let config = new Configuration()

  let titleValidation = await title(createMock('WIP Title'), config.settings)
  expect(titleValidation.mergeable).toBe(false)

  titleValidation = await title(createMock('Some Title'), config.settings)
  expect(titleValidation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let titleValidation = await title(createMock('WIP Title'), config.settings)

  expect(titleValidation.mergeable).toBe(false)
  expect(titleValidation.description).toBe(`Title contains "${Configuration.DEFAULTS.title}"`)

  titleValidation = await title(createMock('Just Title'), config.settings)
  expect(titleValidation.description).toBe(null)
})

const createMock = (title) => {
  return {
    payload: {
      pull_request: {
        title: title
      }
    }
  }
}
