const Helper = require('../__fixtures__/helper')
const Handler = require('../lib/handler')
const Configuration = require('../lib/configuration')
Configuration.DEFAULTS.approvals = 0

test('handlePullRequest when it is mergeable', async () => {
  let context = Helper.mockContext({ title: 'title' })
  await Handler.handlePullRequest(context)

  expect(context.repo).lastCalledWith(
    Helper.expectedStatus('success', 'Okay to merge.')
  )
})

test('handlePullRequest when it is NOT mergeable', async () => {
  let context = Helper.mockContext({ title: 'wip' })
  await Handler.handlePullRequest(context)

  expect(context.repo).lastCalledWith(
    Helper.expectedStatus('failure', 'Title contains "wip|dnm|exp|poc"')
  )
})

// TODO add tests for handleIssues
