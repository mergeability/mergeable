const Helper = require('../__fixtures__/helper')
const label = require('../lib/label')
const Configuration = require('../lib/configuration')

test('fail gracefully if invalid regex', async () => {
  let config = new Configuration(`
    mergeable:
      label: '@#$@#$@#$'
  `)
  let validation = await label(createMockPR(), createMockContext('WIP'), config.settings)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there is only one label', async () => {
  let config = new Configuration()

  let validation = await label(createMockPR(), createMockContext('work in progress'), config.settings)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMockPR(), createMockContext('Some Label'), config.settings)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there are multiple labels', async () => {
  let config = (new Configuration()).settings

  let validation = await label(createMockPR(), createMockContext(['abc', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMockPR(), createMockContext(['Some Label', '123', '456']), config)
  expect(validation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let validation = await label(createMockPR(),
    createMockContext('Work in Progress'), config.settings)

  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(`Label contains "${Configuration.DEFAULTS.label}"`)

  validation = await label(createMockPR(), createMockContext('Just Label'), config.settings)
  expect(validation.description).toBe(null)
})

const createMockContext = (labels) => {
  let labelArray = []
  if (Array.isArray(labels)) {
    labels.forEach((label) => {
      labelArray.push({ name: label })
    })
  } else {
    labelArray = [{ name: labels }]
  }

  return Helper.mockContext({ labels: labelArray })
}

const createMockPR = () => {
  return Helper.mockContext().payload.pull_request
}
