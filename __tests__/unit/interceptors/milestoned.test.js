const Milestoned = require('../../../lib/interceptors/milestoned')
const Helper = require('../../../__fixtures__/unit/helper')
require('object-dot').extend()

const milestoned = new Milestoned()
test('#valid', () => {
  const context = Helper.mockContext()
  expect(milestoned.valid(context)).toBe(false)

  context.eventName = 'issues'
  expect(milestoned.valid(context)).toBe(false)

  context.payload.issue = {}
  context.payload.action = 'milestoned'
  expect(milestoned.valid(context)).toBe(false)

  context.payload.issue.pull_request = {}
  expect(milestoned.valid(context)).toBe(true)

  context.payload.action = 'demilestoned'
  expect(milestoned.valid(context)).toBe(true)

  context.payload.action = 'edited'
  expect(milestoned.valid(context)).toBe(false)
})

test('#process', async () => {
  let context = Helper.mockContext()
  context.eventName = 'issues'
  context.payload.action = 'milestoned'
  Object.set(context, 'payload.issue.pull_request', {})
  context.payload.issue.number = 12
  context.octokit.pulls.get.mockReturnValue({ data: { number: 12 } })

  // make sure we setup context correctly.
  expect(milestoned.valid(context)).toBe(true)

  context = await milestoned.process(context)
  expect(context.payload.pull_request.number).toBe(12)
  expect(context.eventName).toBe('pull_request')
})
