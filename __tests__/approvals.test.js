const approvals = require('../lib/approvals')
const Configuration = require('../lib/configuration')

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

const config = (min) => {
  return (new Configuration(`
    mergeable:
      approvals: ${min}
  `)).settings
}

test('that mergeable is true when less than minimum', async () => {
  let validation = await approvals(createMockContext(1), config(2))
  expect(validation.mergeable).toBe(false)
})

test('that mergeable is true when the same as minimum', async () => {
  let validation = await approvals(createMockContext(2), config(2))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true when greater than minimum', async () => {
  let validation = await approvals(createMockContext(3), config(2))
  expect(validation.mergeable).toBe(true)
})

test('that description is dynamic based on minimum', async () => {
  let validation = await approvals(createMockContext(3), config(5))
  expect(validation.description).toBe('At least 5 review approval(s) required.')
})

test('that description is null when mergeable', async () => {
  let validation = await approvals(createMockContext(5), config(5))
  expect(validation.description).toBe(null)
})
