const Merge = require('../../../lib/actions/merge')
const Helper = require('../../../__fixtures__/unit/helper')

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

test.each([
  undefined,
  'pull_request_review',
  'check_suite',
  'issue_comment'
])('check that merge is called for %s events', async (eventName) => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged, eventName })
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
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_title).toBe(undefined)
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_message).toBe(undefined)
})

test('check that commit_title and commit_message options work correctly', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open' } })
  const settings = {
    merge_method: 'squash',
    commit_title: 'hello world',
    commit_message: 'foobar'
  }

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_title).toBe('hello world')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_message).toBe('foobar')
})

test('check that commit_title and commit_message options support templating', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open', title: 'some pr', body: 'some message', number: 10 } })
  const settings = {
    merge_method: 'squash',
    commit_title: '{{{ title }}} (#{{{ number }}})',
    commit_message: '{{{ body }}}'
  }

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_title).toBe('some pr (#10)')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_message).toBe('some message')
})

test('check that commit_title and commit_message options support empty string', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open', title: 'some pr', body: 'some message', number: 10 } })
  const settings = {
    merge_method: 'squash',
    commit_title: '',
    commit_message: ''
  }

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_title).toBe('')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_message).toBe('')
})

test('check that commit_title and commit_message options do not escape html', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.octokit.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean', state: 'open', title: 'some pr', body: 'some <> \' message', number: 10 } })
  const settings = {
    merge_method: 'squash',
    commit_title: '',
    commit_message: '{{{ body }}}'
  }

  await merge.afterValidate(context, settings)
  expect(context.octokit.pulls.merge.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_title).toBe('')
  expect(context.octokit.pulls.merge.mock.calls[0][0].commit_message).toBe('some <> \' message')
})
