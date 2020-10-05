const Merge = require('../../../lib/actions/merge')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that merge is called if PR has not been merged', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.github.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.github.pulls.merge.mock.calls.length).toBe(1)
  expect(context.github.pulls.merge.mock.calls[0][0].merge_method).toBe('merge')
})

test('check that merge is not called if PR has not been merged', async () => {
  const merge = new Merge()
  const checkIfMerged = true
  const context = Helper.mockContext({ checkIfMerged })
  context.github.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean' } })
  const settings = {}

  await merge.afterValidate(context, settings)
  expect(context.github.pulls.merge.mock.calls.length).toBe(0)
})

test('check that merge_method option works correctly', async () => {
  const merge = new Merge()
  const checkIfMerged = false
  const context = Helper.mockContext({ checkIfMerged })
  context.github.pulls.get.mockReturnValue({ data: { mergeable_state: 'clean' } })
  const settings = {
    merge_method: 'squash'
  }

  await merge.afterValidate(context, settings)
  expect(context.github.pulls.merge.mock.calls.length).toBe(1)
  expect(context.github.pulls.merge.mock.calls[0][0].merge_method).toBe('squash')
})
