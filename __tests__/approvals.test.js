const Helper = require('../__fixtures__/helper')
const approvals = require('../lib/approvals')
const Configuration = require('../lib/configuration')

const defaultPR = {
  user: {
    login: 'creator'
  },
  number: 1
}

test('that mergeable is true when less than minimum', async () => {
  let validation = await approvals(defaultPR, createMockContext(1), config({min: 2}))
  expect(validation.mergeable).toBe(false)
})

test('that mergeable is true when the same as minimum', async () => {
  let validation = await approvals(defaultPR, createMockContext(2), config({min: 2}))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true when greater than minimum', async () => {
  let validation = await approvals(defaultPR, createMockContext(3), config({min: 2}))
  expect(validation.mergeable).toBe(true)
})

test('that description is dynamic based on minimum', async () => {
  let validation = await approvals(defaultPR, createMockContext(3), config({min: 5}))
  expect(validation.description[0]).toBe('Approval count is less than "5"')
})

test('that description is null when mergeable', async () => {
  let validation = await approvals(defaultPR, createMockContext(5), config({min: 5}))
  expect(validation.description).toBe(null)
})

test('mergeable is false if required member(s) has not approved', async () => {
  let reviewList = [
    {
      user: {
        login: 'userA'
      },
      state: 'APPROVED'
    },
    {
      user: {
        login: 'userB'
      },
      state: 'APPROVED'
    }
  ]
  let configuration = `
  mergeable:
    approvals:
      required: 
        reviewers: ['userA', 'userC']
  `
  let validation = await approvals(defaultPR, createMockContext(5, reviewList), config({ config: configuration }))
  expect(validation.description[0]).toBe('Approval: userC required')
})

test('mergeable is false if required user has not approved', async () => {
  let reviewList = [
    {
      user: {
        login: 'userA'
      },
      state: 'APPROVED'
    },
    {
      user: {
        login: 'userB'
      },
      state: 'NOT_APPROVED'
    },
    {
      user: {
        login: 'userC'
      },
      state: 'APPROVED'
    }
  ]
  let configuration = `
  mergeable:
    approvals:
      required:
        reviewers: ['userA', 'userC']
  `

  let validation = await approvals(defaultPR, createMockContext(5, reviewList), config({config: configuration}))
  expect(validation.description).toBe(null)
})

test('pr creator is removed from required reviewer list', async () => {
  // no reviews
  let reviewList = []

  let configuration = `
  mergeable:
    approvals:
      required:
        reviewers: ['creator', 'userC']
  `

  let validation = await approvals(defaultPR, createMockContext(5, reviewList), config({config: configuration}))
  // creator should not be in the description
  expect(validation.description[0]).toBe('Approval: userC required')
})

test('checks that latest review is used', async () => {
  let reviewList = [
    {
      user: {
        login: 'userA'
      },
      state: 'APPROVED',
      submitted_at: Date.now()
    },
    {
      user: {
        login: 'userA'
      },
      state: 'CHANGES_REQUESTED',
      submitted_at: Date.now() + 1000
    }
  ]
  let configuration = `
  mergeable:
    approvals:
      required:
        reviewers: ['userA']
  `

  let validation = await approvals(defaultPR, createMockContext(5, reviewList), config({config: configuration}))
  expect(validation.description[0]).toBe('Approval: userA required')
})

const createMockContext = (minimum, data) => {
  if (!data) {
    data = []
    for (let i = 0; i < minimum; i++) {
      data.push({
        user: {
          login: `user${i}`
        },
        state: 'APPROVED',
        submitted_at: Date.now() + i
      })
    }
  }

  return Helper.mockContext({reviews: data})
}

const config = ({min, config}) => {
  if (min) {
    return (new Configuration(`
    mergeable:
      approvals: ${min}
  `)).settings
  }

  return (new Configuration(config)).settings
}
