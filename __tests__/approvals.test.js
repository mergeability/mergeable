const Approvals = require('../lib/approvals')

const createMockContext = (minimum, data) => {
  if (!data) data = []
  for (let i = 0; i < minimum; i++) {
    data.push({
      state: 'APPROVED'
    })
  }

  return {
    repo: jest.fn(),
    payload: {
      pull_request: {
        number: 1
      }
    },
    github: {
      pullRequests: {
        getReviews: jest.fn().mockReturnValue({ data: data })
      }
    }
  }
}

test('that mergeable is true when less than minimum', async () => {
  let approvals = new Approvals(2)
  let mergeable = await approvals.isMergeable(createMockContext(1))
  expect(mergeable).toBe(false)
})

test('that mergeable is true when the same as minimum', async () => {
  let approvals = new Approvals(2)
  let mergeable = await approvals.isMergeable(createMockContext(2))
  expect(mergeable).toBe(true)
})

test('that mergeable is true when greater than minimum', async () => {
  let approvals = new Approvals(2)
  let mergeable = await approvals.isMergeable(createMockContext(3))
  expect(mergeable).toBe(true)
})

test('that description is dynamic based on minimum', async () => {
  let approvals = new Approvals(5)
  expect(approvals.description()).toBe('5 approvals required.')
})
