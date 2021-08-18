const RequestReview = require('../../../lib/actions/request_review')
const Helper = require('../../../__fixtures__/unit/helper')

const settings = {
  reviewers: ['shine2lay']
}

const result = {
  status: 'pass',
  validations: [{
    status: 'pass',
    name: 'Label'
  }]
}

test('check that user is requested a review if user is an collaborator', async () => {
  const requester = new RequestReview()
  const options = {
    collaborators: [{ login: 'shine2lay' }]
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.requestReviewers.mock.calls[0][0].reviewers[0]).toBe('shine2lay')
})

test('check that author is removed from list of reviewer to request', async () => {
  const requester = new RequestReview()
  const options = {
    collaborators: [{ login: 'shine2lay' }]
  }

  const settings = {
    reviewers: ['creator', 'shine2lay']
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.requestReviewers.mock.calls[0][0].reviewers[0]).toBe('shine2lay')
})

test('that requested Reviewers are not requested again', async () => {
  const requester = new RequestReview()
  const options = {
    requestedReviewers: [{ login: 'shine2lay' }]
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(0)
})

test('that non collaborator is not requested reviews', async () => {
  const requester = new RequestReview()
  const options = {
    collaborators: []
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(0)
})

test('that requested teams are not requested again', async () => {
  const requester = new RequestReview()
  const options = {
    requestedTeams: [{ slug: 'developers' }]
  }

  const teamSettings = {
    teams: ['developers']
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, teamSettings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(0)
})

test('that requested team reviewers are added', async () => {
  const requester = new RequestReview()
  const options = {
    requestedTeams: [{ slug: 'justice-league' }]
  }

  const teamSettings = {
    reviewers: ['shine2lay'],
    teams: ['developers']
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, teamSettings, result)
  expect(context.octokit.pulls.requestReviewers.mock.calls.length).toBe(1)
  expect(context.octokit.pulls.requestReviewers.mock.calls[0][0].team_reviewers[0]).toBe('developers')
})

const createMockContext = (options) => {
  const context = Helper.mockContext(options)

  context.octokit.pulls.requestReviewers = jest.fn()
  return context
}
