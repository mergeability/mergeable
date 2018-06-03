const Helper = require('../__fixtures__/helper')
const approvals = require('../lib/approvals')
const Configuration = require('../lib/configuration')

const defaultPR = {
  user: {
    login: 'creator'
  },
  number: 1
}

test('that it fails gracefully when approval is not defined', async () => {
  let validation = await approvals(defaultPR, createMockContext(1), (new Configuration(`
    mergeable:
  `)).settings.mergeable)
  // mergeable should return true because approval count is zero
  expect(validation.mergeable).toBe(true)
})

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

test('mergeable advanceSetting min works', async () => {
  let configuration = `
  mergeable:
    approvals:
      min: 
        count: 2
        message: 'This is a test message'
  `

  let validation = await approvals(defaultPR, createMockContext(1), config({config: configuration}))
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('This is a test message')

  validation = await approvals(defaultPR, createMockContext(3), config({config: configuration}))
  expect(validation.mergeable).toBe(true)
})

test('mergeable advanceSetting max works', async () => {
  let configuration = `
  mergeable:
    approvals:
      max: 
        count: 2
        message: 'This is a test message'
  `

  let validation = await approvals(defaultPR, createMockContext(3), config({config: configuration}))
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('This is a test message')

  validation = await approvals(defaultPR, createMockContext(1), config({config: configuration}))
  expect(validation.mergeable).toBe(true)
})

test('test pullRequests sub works with advanceSetting max', async () => {
  let configuration = `
  mergeable:
    pull_requests:
      approvals:
        max: 
          count: 2
          message: 'This is a test message'
  `

  let validation = await approvals(defaultPR, createMockContext(3), config({config: configuration}).pull_requests)
  expect(validation.mergeable).toBe(false)
  expect(validation.description[0]).toBe('This is a test message')

  validation = await approvals(defaultPR, createMockContext(1), config({config: configuration}).pull_requests)
  expect(validation.mergeable).toBe(true)
})

test('that ownersEnabled will check owner file and append it to required list', async () => {
  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])
  const configuration = `
  mergeable:
    approvals:
      required:
        reviewers: ['john']
        owners: true
`

  let validations = await approvals(createMockPR(), createMockContext(0, [], codeowner, commitDiffs), config({config: configuration}))
  expect(validations.mergeable).toBe(false)
  expect(validations.description[0]).toBe('Approval: john ,bob(Code Owner) required')

  commitDiffs = createCommitDiffs(['another/file/path/test.js'])

  // bob shouldn't appear because he is not the owner of the files in the PR
  validations = await approvals(createMockPR(), createMockContext(0, [], codeowner, commitDiffs), config({config: configuration}))
  expect(validations.mergeable).toBe(false)
  expect(validations.description[0]).toBe('Approval: john required')
})

test('that ownersEnabled will check owner file and is mergeable when approval is given', async () => {
  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])
  const configuration = `
  mergeable:
    approvals:
      required:
        owners: true
`
  let reviews = createReviewList(['bob'])
  let validations = await approvals(createMockPR(), createMockContext(0, [], codeowner, commitDiffs), config({config: configuration}))
  expect(validations.mergeable).toBe(false)
  expect(validations.description[0]).toBe('Approval: bob(Code Owner) required')

  validations = await approvals(createMockPR(), createMockContext(0, reviews, codeowner, commitDiffs), config({config: configuration}))
  expect(validations.mergeable).toBe(true)
})

const createCommitDiffs = (diffs) => {
  return diffs.map(diff => ({
    filename: diff
  }))
}

const createMockContext = (minimum, data, owners, commitDiffs) => {
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

  return Helper.mockContext({reviews: data, codeowners: Buffer.from(`${owners}`).toString('base64'), compareCommits: commitDiffs})
}

const createMockPR = () => {
  return Helper.mockContext({
    user: {
      login: 'creator'
    },
    number: 1
  }).payload.pull_request
}

const createReviewList = (reviewers) => {
  return reviewers.map(reviewer => ({
    user: {
      login: reviewer
    },
    state: 'APPROVED'
  }))
}

const config = ({min, config}) => {
  if (min) {
    return (new Configuration(`
    mergeable:
      approvals: ${min}
  `)).settings.mergeable
  }

  return (new Configuration(config)).settings.mergeable
}
