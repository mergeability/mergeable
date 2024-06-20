const Helper = require('../../../__fixtures__/unit/helper')
const Approval = require('../../../lib/validators/approvals')
const Teams = require('../../../lib/validators/options_processor/teams')
const Owners = require('../../../lib/validators/options_processor/owners')

jest.mock('../../../lib/validators/options_processor/teams', () => ({
  extractTeamMemberships: jest.fn()
}))

jest.mock('../../../lib/validators/options_processor/owners', () => ({
  process: jest.fn()
}))

test('that approvals work with no owners file', async () => {
  const approval = new Approval()
  const settings = {
    do: 'approval',
    min: {
      count: 2
    }
  }
  const validation = await approval.processValidate(createMockContext(1, null, true), settings)
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

  const validation = await approval.processValidate(createMockContext(1), settings)
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

  const validation = await approval.processValidate(createMockContext(2), settings)
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

  const validation = await approval.processValidate(createMockContext(3), settings)
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

  const validation = await approval.processValidate(createMockContext(3), settings)
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

  const validation = await approval.processValidate(createMockContext(5), settings)
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

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval: userC required')
})

test('mergeable is false if excluded member(s) has approved', async () => {
  const approval = new Approval()
  const reviewList = [
    {
      user: {
        login: 'userA'
      },
      state: 'APPROVED'
    }
  ]
  const settings = {
    do: 'approval',
    min: {
      count: 1
    },
    exclude: {
      users: ['userA']
    }
  }

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval count is less than "1"')
})

test('mergeable passes if required user has approved', async () => {
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

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('validate correctly when one required user approved but followed up with comments.', async () => {
  const approval = new Approval()
  const reviewList = [
    {
      user: { login: 'userA' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 5000
    },
    {
      user: { login: 'userB' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 4000
    },
    {
      user: { login: 'userA' },
      state: 'APPROVED',
      submitted_at: Date.now() - 3000
    },
    {
      user: { login: 'userB' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 2000
    },
    {
      user: { login: 'userB' },
      state: 'APPROVED',
      submitted_at: Date.now() - 1000
    },
    {
      user: { login: 'userA' },
      state: 'COMMENTED',
      submitted_at: Date.now()
    },
    {
      user: { login: 'userC' },
      state: 'COMMENTED',
      submitted_at: Date.now()
    }
  ]
  const settings = {
    do: 'approval',
    required: {
      reviewers: ['userA']
    }
  }
  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].details.input).toEqual(['userB', 'userA'])
  expect(validation.status).toBe('pass')
})

test('validate correctly when one required user approved but followed up with REQUEST_CHANGE or PENDING.', async () => {
  const approval = new Approval()
  const reviewList = [
    {
      user: { login: 'userA' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 5000
    },
    {
      user: { login: 'userB' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 4000
    },
    {
      user: { login: 'userA' },
      state: 'APPROVED',
      submitted_at: Date.now() - 3000
    },
    {
      user: { login: 'userB' },
      state: 'COMMENTED',
      submitted_at: Date.now() - 2000
    },
    {
      user: { login: 'userB' },
      state: 'APPROVED',
      submitted_at: Date.now() - 1000
    },
    {
      user: { login: 'userA' },
      state: 'CHANGES_REQUESTED',
      submitted_at: Date.now() - 500
    },
    {
      user: { login: 'userC' },
      state: 'APPROVED',
      submitted_at: Date.now()
    }
  ]

  // test with more than one required.
  let validation = await approval.processValidate(createMockContext(5, reviewList), {
    do: 'approval',
    required: {
      reviewers: ['userA', 'userB']
    }
  })
  expect(validation.validations[0].details.input).toEqual(['userC', 'userB'])
  expect(validation.status).toBe('fail') // userA not found.

  // test with only one required.
  validation = await approval.processValidate(createMockContext(5, reviewList), {
    do: 'approval',
    required: {
      reviewers: ['userA']
    }
  })
  expect(validation.status).toBe('fail')
})

test('validate correctly with reviews more than 30.', async () => {
  const approval = new Approval()
  const reviewList = [
    {
      user: { login: 'user1' },
      state: 'APPROVED',
      submitted_at: Date.now() - 5000
    }]

  for (let i = 0; i < 40; i++) {
    reviewList.push({
      user: {
        login: `user${i}`
      },
      state: 'COMMENTED',
      submitted_at: Date.now() + i
    })
  }
  reviewList.push({
    user: {
      login: 'user2'
    },
    state: 'APPROVED',
    submitted_at: Date.now() + 1000
  })
  const context = createMockContext(5, reviewList)
  const validation = await approval.processValidate(context, {
    do: 'approval',
    required: {
      reviewers: ['user1', 'user2']
    }
  })
  expect(validation.validations[0].details.input).toEqual(['user2', 'user1'])
  expect(validation.status).toBe('pass')
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

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
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

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
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

  let validation = await approval.processValidate(createMockContext(1), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('This is a test message')

  validation = await approval.processValidate(createMockContext(3), settings)
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

  let validation = await approval.processValidate(createMockContext(3), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('This is a test message')

  validation = await approval.processValidate(createMockContext(1), settings)
  expect(validation.status).toBe('pass')
})

describe('required.owners ', () => {
  beforeEach(() => {
    Owners.process.mockClear()
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

    Owners.process = jest.fn().mockReturnValue(['bob'])

    let validations = await approval.processValidate(createMockContext(0, []), settings)
    expect(validations.status).toBe('fail')
    expect(validations.validations[0].description).toBe('approval: john ,bob(Code Owner) required')

    Owners.process = jest.fn().mockReturnValue([])

    // bob shouldn't appear because he is not the owner of the files in the PR
    validations = await approval.processValidate(createMockContext(0, []), settings)
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

    Owners.process = jest.fn().mockReturnValue(['bob'])

    const reviews = createReviewList(['bob'])
    let validations = await approval.processValidate(createMockContext(0, []), settings)
    expect(validations.status).toBe('fail')
    expect(validations.validations[0].description).toBe('approval: bob(Code Owner) required')

    validations = await approval.processValidate(createMockContext(0, reviews), settings)
    expect(validations.status).toBe('pass')
  })

  test('that ownersDisabled will call NOT call owners.process', async () => {
    const approval = new Approval()
    const settings = {
      do: 'approval'
    }

    const context = createMockContext(0, [])

    await approval.processValidate(context, settings)
    expect(Owners.process.mock.calls.length).toBe(0)
  })
})

test('that assignees are not required when assignees is not specified', async () => {
  const approval = new Approval()
  const assignees = createAssigneeList(['john'])
  const settings = {
    do: 'approval',
    required: {
      reviewers: ['bob']
    }
  }

  const reviewList = createReviewList(['bob'])
  const validation = await approval.processValidate(createMockContext(5, reviewList, assignees), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('that assignees are not required when assignees is false', async () => {
  const approval = new Approval()
  const assignees = createAssigneeList(['john'])
  const settings = {
    do: 'approval',
    required: {
      assignees: false,
      reviewers: ['bob']
    }
  }

  const reviewList = createReviewList(['bob'])
  const validation = await approval.processValidate(createMockContext(5, reviewList, assignees), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('that assignees are required when assignees is true', async () => {
  const approval = new Approval()
  const assignees = createAssigneeList(['john'])
  const settings = {
    do: 'approval',
    required: {
      assignees: true
    }
  }

  let reviewList = createReviewList(['bob'])
  let validation = await approval.processValidate(createMockContext(5, reviewList, assignees), settings)
  expect(validation.validations[0].description).toBe('approval: john(Assignee) required')
  expect(validation.status).toBe('fail')

  reviewList = createReviewList(['bob', 'john'])
  validation = await approval.processValidate(createMockContext(5, reviewList, assignees), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('that assignees appends to the reviewers list correctly', async () => {
  const approval = new Approval()
  const assignees = createAssigneeList(['john'])
  const settings = {
    do: 'approval',
    required: {
      assignees: true,
      reviewers: ['bob']
    }
  }

  let validation = await approval.processValidate(createMockContext(5, [], assignees), settings)
  expect(validation.validations[0].description).toBe('approval: bob ,john(Assignee) required')
  expect(validation.status).toBe('fail')

  const reviewList = createReviewList(['bob', 'john'])
  validation = await approval.processValidate(createMockContext(5, reviewList, assignees), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('that requestedReviewers appends to the reviewers list correctly', async () => {
  const approval = new Approval()
  const requestedReviewers = createRequestedReviewersList(['john'])
  const settings = {
    do: 'approval',
    required: {
      requested_reviewers: true,
      reviewers: ['bob']
    }
  }

  let validation = await approval.processValidate(createMockContext(5, [], [], requestedReviewers), settings)
  expect(validation.validations[0].description).toBe('approval: bob ,john(Requested Reviewer) required')
  expect(validation.status).toBe('fail')

  const reviewList = createReviewList(['bob', 'john'])
  validation = await approval.processValidate(createMockContext(5, reviewList, [], requestedReviewers), settings)
  expect(validation.validations[0].description).toBe('approval: all required reviewers have approved')
  expect(validation.status).toBe('pass')
})

test('blocks if changes are requested', async () => {
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
        login: 'userB'
      },
      state: 'CHANGES_REQUESTED',
      submitted_at: Date.now() + 1000
    }
  ]

  const settings = {
    do: 'approval',
    block: {
      changes_requested: true
    }
  }

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations[0].description).toBe('Please resolve all the changes requested')
  expect(validation.status).toBe('fail')
})

test('blocks if changes are requested while other options area also passed in', async () => {
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
        login: 'userB'
      },
      state: 'CHANGES_REQUESTED',
      submitted_at: Date.now() + 1000
    }
  ]

  const settings = {
    do: 'approval',
    block: {
      changes_requested: true
    },
    required: {
      reviewers: ['userA']
    }
  }

  const validation = await approval.processValidate(createMockContext(5, reviewList), settings)
  expect(validation.validations.length).toBe(2)
  expect(validation.validations[1].description).toBe('Please resolve all the changes requested')
  expect(validation.status).toBe('fail')
})

test('returns proper error when team provided is not found', async () => {
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
        login: 'userB'
      },
      state: 'CHANGES_REQUESTED',
      submitted_at: Date.now() + 1000
    }
  ]

  const settings = {
    do: 'approval',
    limit: {
      teams: ['test-org/test-team']
    },
    required: {
      reviewers: ['userA']
    }
  }

  const validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings, [])
  expect(validation.validations.length).toBe(2)
  expect(validation.validations[1].description).toBe('approval: userA required')
})

describe('required.owners ', () => {
  beforeEach(() => {
    Owners.process.mockClear()
  })

  test('limit.teams option works properly', async () => {
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
          login: 'userB'
        },
        state: 'APPROVED',
        submitted_at: Date.now() + 1000
      }
    ]

    const settings = {
      do: 'approval',
      limit: {
        teams: ['test-org/test-team']
      },
      required: {
        reviewers: ['userA']
      }
    }

    Teams.extractTeamMembers = jest.fn().mockReturnValue(['userB'])

    const validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings)
    expect(validation.validations.length).toBe(2)
    expect(validation.status).toBe('fail')
    expect(validation.validations[1].description).toBe('approval: userA required')
  })

  test('limit.users option works properly', async () => {
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
          login: 'userB'
        },
        state: 'APPROVED',
        submitted_at: Date.now() + 1000
      }
    ]

    let settings = {
      do: 'approval',
      limit: {
        users: ['userB']
      },
      min: {
        count: 2
      }
    }

    let validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings)

    expect(validation.validations.length).toBe(2)
    expect(validation.status).toBe('fail')
    expect(validation.validations[1].description).toBe('approval count is less than "2"')

    settings = {
      do: 'approval',
      limit: {
        users: ['userB', 'userA']
      },
      min: {
        count: 2
      }
    }

    validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings)

    expect(validation.validations.length).toBe(2)
    expect(validation.status).toBe('pass')
  })

  test('limit.owners option works properly', async () => {
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
          login: 'userB'
        },
        state: 'APPROVED',
        submitted_at: Date.now() + 1000
      }
    ]

    const settings = {
      do: 'approval',
      limit: {
        owners: true
      },
      required: {
        reviewers: ['userA']
      }
    }

    Owners.process = jest.fn().mockReturnValue(['userB'])
    const validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings)

    expect(validation.validations.length).toBe(2)
    expect(validation.status).toBe('fail')
    expect(validation.validations[1].description).toBe('approval: userA required')
  })

  test('limit option will create an "info" validation', async () => {
    const approval = new Approval()

    const reviewList = [
      {
        user: {
          login: 'userA'
        },
        state: 'APPROVED',
        submitted_at: Date.now()
      }
    ]

    const settings = {
      do: 'approval',
      limit: {
        owners: true
      }
    }

    Owners.process = jest.fn().mockReturnValue(['userB'])
    const validation = await approval.processValidate(createMockContext(5, reviewList, null, null, false), settings)

    expect(validation.validations.length).toBe(1)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].status).toBe('info')
    expect(validation.validations[0].description).toBe('Only approvals from following sources are counted')
  })
})

const createMockContext = (minimum, data, assignees, requestedReviewers, isOwnersNotFound = false) => {
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

  return Helper.mockContext({ reviews: data, files: [], assignees, requestedReviewers })
}

const createAssigneeList = (assignees) => {
  return assignees.map(assignee => ({
    login: assignee
  }))
}

const createRequestedReviewersList = (requestedReviewers) => {
  return requestedReviewers.map(requestedReviewer => ({
    login: requestedReviewer
  }))
}

const createReviewList = (reviewers) => {
  return reviewers.map(reviewer => ({
    user: {
      login: reviewer
    },
    state: 'APPROVED'
  }))
}
