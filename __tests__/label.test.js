const label = require('../lib/label')
const Configuration = require('../lib/configuration')

test('fail gracefully if invalid regex', async () => {
  let config = new Configuration(`
    mergeable:
      label: '@#$@#$@#$'
  `)
  let validation = await label(createMock('WIP'), config.settings)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there is only one label', async () => {
  let config = new Configuration()

  let validation = await label(createMock('work in progress'), config.settings)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMock('Some Label'), config.settings)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there are multiple labels', async () => {
  let config = (new Configuration()).settings

  let validation = await label(createMock(['abc', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMock(['Some Label', '123', '456']), config)
  expect(validation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration()
  let validation = await label(createMock('Work in Progress'), config.settings)

  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(`Label contains "${Configuration.DEFAULTS.label}"`)

  validation = await label(createMock('Just Label'), config.settings)
  expect(validation.description).toBe(null)
})

const createMock = (labels) => {
  let labelArray = []
  if (Array.isArray(labels)) {
    labels.forEach((label) => {
      labelArray.push({ name: label })
    })
  } else {
    labelArray = [{ name: labels }]
  }

  return {
    repo: jest.fn(),
    payload: {
      pull_request: { number: 1 }
    },
    github: {
      issues: {
        getIssueLabels: () => {
          return { data: labelArray }
        }
      }
    }
  }
}
