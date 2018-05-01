const Helper = require('../__fixtures__/helper')
const Handler = require('../lib/handler')
const Configuration = require('../lib/configuration')
Configuration.DEFAULTS.approvals = 0

test('handlePullRequest when it is mergeable', async () => {
  let context = mockContext('title')
  Handler.handlePullRequest(context).then(() => {
    expect(context.repo).lastCalledWith(
      Helper.expectedStatus('success', 'Okay to merge.')
    )
  })
})

test('handlePullRequest when it is NOT mergeable', async () => {
  let context = mockContext('wip')
  Handler.handlePullRequest(context).then(() => {
    expect(context.repo).lastCalledWith(
      Helper.expectedStatus('failure', 'Title contains "wip|dnm|exp|poc"')
    )
  })
})

// TODO add tests for handleIssues

const mockContext = (title) => {
  let context = Helper.mockContext({ title: title })
  context.repo = jest.fn((arg) => {
    if (!arg) return { owner: 'owner', repo: 'repo' }
  })
  return context
}
