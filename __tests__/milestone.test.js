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
  expect(validation.description).toBe(`Milestone must be ${settings.mergeable.milestone}"`)
})

// TODO move this to a more relevant test when we refactor index.js
// test('issue event that is a PR should validate appropriately', async () => {
//   let settings = createMockConfig('Version 1').settings
//   let validation = await milestone(createMockIssueEvent('version 1', true), settings)
//   expect(validation.mergeable).toBe(true)
//
//   validation = await milestone(createMockIssueEvent('version 2', true), settings)
//   expect(validation.mergeable).toBe(false)
// })
//

// test('issue event that is NOT a PR should return mergeable as true', async () => {
//   let settings = createMockConfig('Version 1').settings
//
//   let validation = await milestone(createMockIssueEvent('version 1', false), settings)
//   expect(validation.mergeable).toBe(true)
//   validation = await milestone(createMockIssueEvent('version 2', false), settings)
//   expect(validation.mergeable).toBe(true)
// })

const createMockConfig = (milestone) => {
  return new Configuration(`
    mergeable:
      milestone: ${milestone}
  `)
}

// TODO move this to a more relevant test when we refactor index.js
// const createMockIssueEvent = (milestone, isPR) => {
//   let data = {
//     payload: {
//       issue: { milestone: {title: milestone} }
//     }
//   }
//
//   if (isPR) data.payload.issue.pull_request = {url: 'https://api.github.com/repos/abc/def/pulls/1'}
//
//   return data
// }

const createMockPR = (milestone) => {
  return { milestone: {
    title: (milestone === undefined) ? null : milestone
  }}
}
