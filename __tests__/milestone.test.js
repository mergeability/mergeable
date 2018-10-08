const milestone = require('../lib/milestone')
const Configuration = require('../lib/configuration')
const Helper = require('../__fixtures__/helper')

test('should be false when a different milestone is specified', async () => {
  let validation = await milestone(createMockPR({milestone: 'Version 2'}), null, createMockConfig('Version 1').settings.mergeable)
  expect(validation.mergeable).toBe(false)
})

test('shoud be true regardless when milestone is null in settings', async () => {
  let validation = await milestone(createMockPR({milestone: 'Version 2'}), null, (new Configuration()).settings.mergeable)
  expect(validation.mergeable).toBe(true)
})

test('shoud be false when milestone is set in settings but null in PR', async () => {
  let validation = await milestone(createMockPR({}), null, createMockConfig('Version 1').settings.mergeable)
  expect(validation.mergeable).toBe(false)
})

test('description should be correct', async () => {
  let settings = createMockConfig('Version 1').settings.mergeable
  let validation = await milestone(createMockPR({}), null, settings)
  expect(validation.description).toBe(`Milestone must be "${settings.milestone}"`)
})

test('checks that deep validation works if it closes an issue with milestone requirement', async () => {
  let settings = createMockConfig('Version 1').settings.mergeable
  let validation = await milestone(createMockPR({body: 'closes #1'}), createMockContext(), settings)
  console.log(validation)
  expect(validation.mergeable).toBe(true)
})

test('checks that deep validation works if it closes an issue with milestone requirement', async () => {
  let settings = createMockConfig('Version 1').settings.mergeable
  let validation = await milestone(createMockPR({body: 'closes #2'}), createMockContext({milestone: {title: 'Version 2'}}), settings)
  expect(validation.mergeable).toBe(false)
})

const createMockContext = (data) => {
  if (!data) data = {milestone: {title: 'Version 1'}}

  return Helper.mockContext({deepValidation: data})
}

const createMockConfig = (milestone) => {
  return new Configuration(`
    mergeable:
      milestone: ${milestone}
  `)
}

const createMockPR = ({milestone, body}) => {
  return {
    milestone: {
      title: (milestone === undefined) ? null : milestone
    },
    body: (body === undefined) ? '' : body}
}
