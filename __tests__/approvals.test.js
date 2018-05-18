const Helper = require('../__fixtures__/helper')
const approvals = require('../lib/approvals')
const Configuration = require('../lib/configuration')

test('that mergeable is true when less than minimum', async () => {
  let validation = await approvals({ number: 1 }, createMockContext(1), config({min: 2}))
  expect(validation.mergeable).toBe(false)
})

test('that mergeable is true when the same as minimum', async () => {
  let validation = await approvals({ number: 1 }, createMockContext(2), config({min: 2}))
  console.log(validation)
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is true when greater than minimum', async () => {
  let validation = await approvals({ number: 1 }, createMockContext(3), config({min: 2}))
  expect(validation.mergeable).toBe(true)
})

test('that description is dynamic based on minimum', async () => {
  let validation = await approvals({ number: 1 }, createMockContext(3), config({min: 5}))
  expect(validation.description[0]).toBe('Approval count is less than "5"')
})

test('that description is null when mergeable', async () => {
  let validation = await approvals({ number: 1 }, createMockContext(5), config({min: 5}))
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
  let validation = await approvals({ number: 1 }, createMockContext(5, reviewList), config({ config: configuration }))
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

  let validation = await approvals({ number: 1 }, createMockContext(5, reviewList), config({config: configuration}))
  expect(validation.description).toBe(null)
})

const createMockContext = (minimum, data) => {
  if (!data) {
    data = []
    for (let i = 0; i < minimum; i++) {
      data.push({
        state: 'APPROVED'
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
