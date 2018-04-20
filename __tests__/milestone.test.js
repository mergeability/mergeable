const milestone = require('../lib/milestone')
const Configuration = require('../lib/configuration')

test('should be false when a different milestone is specified', async () => {
  let validation = await milestone(createMockPayload('Version 2'), createMockConfig('Version 1').settings)
  expect(validation.mergeable).toBe(false)
})

test('shoud be true regardless when milestone is null in settings', async () => {
  let validation = await milestone(createMockPayload('Version 2'), (new Configuration()).settings)
  expect(validation.mergeable).toBe(true)
})

test('shoud be false when milestone is set in settings but null in PR', async () => {
  let validation = await milestone(createMockPayload(), createMockConfig('Version 1').settings)
  expect(validation.mergeable).toBe(false)
})

test('description should be correct', async () => {
  let settings = createMockConfig('Version 1').settings
  let validation = await milestone(createMockPayload(), settings)
  expect(validation.description).toBe(`Milestone must be ${settings.mergeable.milestone}"`)
})

const createMockConfig = (milestone) => {
  return new Configuration(`
    mergeable:
      milestone: ${milestone}
  `)
}

const createMockPayload = (milestone) => {
  let data = {
    payload: {
      pull_request: {
      }
    }
  }

  if (milestone === undefined) data.payload.pull_request.milestone = null
  else data.payload.pull_request.milestone = { title: milestone }

  return data
}
