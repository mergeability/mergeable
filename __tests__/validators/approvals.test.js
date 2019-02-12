const Helper = require('../../__fixtures__/helper')
const Approval = require('../../lib/validators/approvals')

test('that approvals work with no owners file', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2
    }
  }
  let validation = await approval.validate(createMockContext(1, null, null, null, true), settings)
  expect(validation.status).toBe('fail')
})

test('that mergeable is false when less than minimum', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2
    }
  }

  let validation = await approval.validate(createMockContext(1), settings)
  expect(validation.status).toBe('fail')
})

test('that mergeable is true when the same as minimum', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2
    }
  }

  let validation = await approval.validate(createMockContext(2), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is true when greater than minimum', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2
    }
  }

  let validation = await approval.validate(createMockContext(3), settings)
  expect(validation.status).toBe('pass')
})

test('that description is dynamic based on minimum', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 5
    }
  }

  let validation = await approval.validate(createMockContext(3), settings)
  expect(validation.validations[0].description).toBe('approval count is less than "5"')
})

test('that description is null when mergeable', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 5
    }
  }

  let validation = await approval.validate(createMockContext(5), settings)
  expect(validation.validations[0].description).toBe("approval does have a minimum of '5'")
})

test('mergeable is false if required member(s) has not approved', async () => {
  const approval = new Approval()
  const reviewList = [
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
  const settings = {
    do: 'approval',
    required: {
      reviewers: ['userA', 'userC']
    }
  }

  let validation = await approval.validate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval: userC required')
})

test('mergeable is false if required user has not approved', async () => {
  const approval = new Approval()
  const reviewList = [
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
  const settings = {
    do: 'approval',
    required: {
      reviewers: ['userA', 'userC']
    }
  }

  let validation = await approval.validate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
})

test('pr creator is removed from required reviewer list', async () => {
  const approval = new Approval()
  // no reviews
  const reviewList = []

  const settings = {
    do: 'approval',
    required: {
      reviewers: ['creator', 'userC']
    }
  }

  let validation = await approval.validate(createMockContext(5, reviewList), settings)
  // creator should not be in the description
  expect(validation.validations[0].description).toBe('approval: userC required')
})

test('checks that latest review is used', async () => {
  const approval = new Approval()
  const reviewList = [
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

  const settings = {
    do: 'approval',
    required: {
      reviewers: ['userA']
    }
  }

  let validation = await approval.validate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval: userA required')
})

test('mergeable advanceSetting min works', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2,
      message: 'This is a test message'
    }
  }

  let validation = await approval.validate(createMockContext(1), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('This is a test message')

  validation = await approval.validate(createMockContext(3), settings)
  expect(validation.status).toBe('pass')
})

test('mergeable advanceSetting max works', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    max: {
      count: 2,
      message: 'This is a test message'
    }
  }

  let validation = await approval.validate(createMockContext(3), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('This is a test message')

  validation = await approval.validate(createMockContext(1), settings)
  expect(validation.status).toBe('pass')
})

test('that ownersEnabled will check owner file and append it to required list', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    required: {
      reviewers: ['john'],
      owners: true
    }
  }

  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])

  let validations = await approval.validate(createMockContext(0, [], codeowner, commitDiffs), settings)
  expect(validations.status).toBe('fail')
  expect(validations.validations[0].description).toBe('approval: john ,bob(Code Owner) required')

  commitDiffs = createCommitDiffs(['another/file/path/test.js'])

  // bob shouldn't appear because he is not the owner of the files in the PR
  validations = await approval.validate(createMockContext(0, [], codeowner, commitDiffs), settings)
  expect(validations.status).toBe('fail')
  expect(validations.validations[0].description).toBe('approval: john required')
})

test('that ownersEnabled will check owner file and is mergeable when approval is given', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    required: {
      owners: true
    }
  }

  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])

  let reviews = createReviewList(['bob'])
  let validations = await approval.validate(createMockContext(0, [], codeowner, commitDiffs), settings)
  expect(validations.status).toBe('fail')
  expect(validations.validations[0].description).toBe('approval: bob(Code Owner) required')

  validations = await approval.validate(createMockContext(0, reviews, codeowner, commitDiffs), settings)
  expect(validations.status).toBe('pass')
})

test('that ownersEnabled will call fetch OWNERS file', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    required: {
      owners: true
    }
  }

  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])

  const context = createMockContext(0, [], codeowner, commitDiffs)
  context.github.repos.getContent = jest.fn().mockReturnValue(new Promise((resolve) => resolve({ data: {
    content: codeowner
  }})))

  await approval.validate(context, settings)
  expect(context.github.repos.getContent.mock.calls[0][0].path).toBe('.github/CODEOWNERS')
})

test('that ownersDisabled will call NOT fetch OWNERS file', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval'
  }

  const codeowner = `*.go @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.go'])

  const context = createMockContext(0, [], codeowner, commitDiffs)
  context.github.repos.getContent = jest.fn().mockReturnValue(
    new Promise((resolve) => resolve({ data: {
      content: codeowner
    }})))

  await approval.validate(context, settings)
  expect(context.github.repos.getContent.mock.calls.length).toBe(0)
})

const createCommitDiffs = (diffs) => {
  return diffs.map(diff => ({
    filename: diff
  }))
}

const createMockContext = (minimum, data, owners, commitDiffs, isOwnersNotFound = false) => {
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

  let codeowners = (isOwnersNotFound || !owners) ? null : Buffer.from(`${owners}`).toString('base64')
  return Helper.mockContext({reviews: data, codeowners: codeowners, compareCommits: commitDiffs})
}

const createReviewList = (reviewers) => {
  return reviewers.map(reviewer => ({
    user: {
      login: reviewer
    },
    state: 'APPROVED'
  }))
}
