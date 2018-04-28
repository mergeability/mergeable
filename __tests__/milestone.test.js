const milestone = require('../lib/milestone')
const Configuration = require('../lib/configuration')

test('should be false when a different milestone is specified', async () => {
  let validation = await milestone(createMockPR('Version 2'), null, createMockConfig('Version 1').settings)
  expect(validation.mergeable).toBe(false)
})

test('shoud be true regardless when milestone is null in settings', async () => {
  let validation = await milestone(createMockPR('Version 2'), null, (new Configuration()).settings)
  expect(validation.mergeable).toBe(true)
})

test('shoud be false when milestone is set in settings but null in PR', async () => {
  let validation = await milestone(createMockPR(), null, createMockConfig('Version 1').settings)
  expect(validation.mergeable).toBe(false)
})

test('description should be correct', async () => {
  let settings = createMockConfig('Version 1').settings
  let validation = await milestone(createMockPR(), null, settings)
  expect(validation.description).toBe(`Milestone must be "${settings.mergeable.milestone}"`)
})

const createMockConfig = (milestone) => {
  return new Configuration(`
    mergeable:
      milestone: ${milestone}
  `)
}

const createMockPR = (milestone) => {
  return { milestone: {
    title: (milestone === undefined) ? null : milestone
  }}
}
