const Merge = require('../../../lib/actions/merge')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that merge is called if PR has not been merged', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('merge')
})

test('check that merge is called for review events', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged, eventName: 'pull_request_review' })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('merge')
})

test('check that merge is called for status events', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged, eventName: 'status' })
  context.octokit.search = {
    issuesAndPullRequests: jest.fn().mockReturnValue({
      data: { items: [{ pull_request: true, number: 1 }, { pull_request: false, number: 2 }] }
    })
  }
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.search.issuesAndPullRequests.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('merge')
})

test('check that merge is called for check suite events', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged, eventName: 'check_suite' })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('merge')
})

test('check that merge is not called if PR is in a blocked state', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'blocked', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(0)
})

test('check that merge is not called if PR is closed', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'closed' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(0)
})

test('check that merge is not called if PR has not been merged', async () => {
  const merge = new Merge()
  const checkIfMerged = true
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(0)
})

test('check that merge_method option works correctly', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {
    merge_method: 'squash'
  }

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
})
