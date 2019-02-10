const RequestReview = require('../../lib/actions/request_review')
const Helper = require('../../__fixtures__/helper')

const settings = {
  reviewers: ['shine2lay']
}

let result = {
  status: 'pass',
  validations: [{
    status: 'pass',
    name: 'Label'
  }]
}

test('check that user is requested a review', async () => {
  const requester = new RequestReview()
  const context = createMockContext()

  await requester.afterValidate(context, settings, result)
  expect(context.github.pullRequests.createReviewRequest.mock.calls.length).toBe(1)
  expect(context.github.pullRequests.createReviewRequest.mock.calls[0][0].reviewers[0]).toBe('shine2lay')
})

test('that only call request Review if current user is not already requested', async () => {
  const requester = new RequestReview()
  const options = {
    requestedReviewers: [{login: 'shine2lay'}]
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.github.pullRequests.createReviewRequest.mock.calls.length).toBe(0)
})

const createMockContext = (options) => {
  let context = Helper.mockContext(options)

  context.github.pullRequests.createReviewRequest = jest.fn()
  return context
}
