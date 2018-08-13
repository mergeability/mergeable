const Helper = require('../__fixtures__/helper')
const label = require('../lib/label')
const Configuration = require('../lib/configuration')

test('fail gracefully if invalid regex', async () => {
  let config = new Configuration(`
    mergeable:
      label: '@#$@#$@#$'
  `).settings.mergeable
  let validation = await label(createMockPR(), createMockContext('WIP'), config)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there is only one label', async () => {
  let config = new Configuration().settings.mergeable

  let validation = await label(createMockPR(), createMockContext('work in progress'), config)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMockPR(), createMockContext('Some Label'), config)
  expect(validation.mergeable).toBe(true)
})

test('mergeable is false if regex found or true if not when there are multiple labels', async () => {
  let config = (new Configuration()).settings.mergeable
  let validation = await label(createMockPR(), createMockContext(['abc', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMockPR(), createMockContext(['Some Label', '123', '456']), config)
  expect(validation.mergeable).toBe(true)
})

test('description is correct', async () => {
  let config = new Configuration().settings.mergeable
  let validation = await label(createMockPR(),
    createMockContext('Work in Progress'), config)

  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe(`Label contains "${Configuration.DEFAULTS.label}"`)

  validation = await label(createMockPR(), createMockContext('Just Label'), config)
  expect(validation.description).toBe(null)
})

test('mergeable is true if must_include is one of the label', async () => {
  let config = new Configuration(`
    mergeable:
      label:
        must_include: 'abc'
  `).settings.mergeable

  let validation = await label(createMockPR(), createMockContext(['abc', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(true)

  validation = await label(createMockPR(), createMockContext(['Some Label', '123', '456']), config)
  expect(validation.mergeable).toBe(false)
})

test('mergeable is false if must_exclude is one of the label', async () => {
  let config = new Configuration(`
    mergeable:
      label:
        must_exclude: 'xyz'
  `).settings.mergeable

  let validation = await label(createMockPR(), createMockContext(['abc', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(false)

  validation = await label(createMockPR(), createMockContext(['Some Label', '123', '456']), config)
  expect(validation.mergeable).toBe(true)
})

test('complex Logic test', async () => {
  let config = new Configuration(`
    mergeable:
      label:
        or:
          - and:
            - must_include:
                regex: 'release note: yes'
                message: 'Please include release note: yes'
            - must_include:
                regex: 'lang\\/core|lang\\/c\\+\\+|lang\\/c#'
                message: 'Please include a language label'
          - must_include:
              regex: 'release note: no'
              message: 'Please include release note: no'
  `).settings.mergeable

  console.log(config.label.or[0].and)

  let validation = await label(createMockPR(), createMockContext(['release note: no', 'experimental', 'xyz']), config)
  expect(validation.mergeable).toBe(true)

  validation = await label(createMockPR(), createMockContext(['release note: yes', '123', '456']), config)
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('((Please include a language label)  ***OR***  Please include release note: no)')

  validation = await label(createMockPR(), createMockContext(['lang/core', '456']), config)
  console.log(validation)
  expect(validation.description[0]).toBe('((Please include release note: yes)  ***OR***  Please include release note: no)')

  validation = await label(createMockPR(), createMockContext(['release note: yes', 'lang/core', '456']), config)
  expect(validation.mergeable).toBe(true)
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
