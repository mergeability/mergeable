const Helper = require('../../../__fixtures__/unit/helper')
const Commit = require('../../../lib/validators/commit')

test('validate returns correctly', async () => {
  const commit = new Commit()
  const settings = {
    do: 'commit',
    message: {
      regex: 'feat:'
    }
  }
  const date = Date.now()
  const commits = [
    {
      commit: {
        author: {
          date
        },
        message: 'fix: this'
      }
    },
    {
      commit: {
        author: {
          date: date + 1
        },
        message: 'feat: that'
      }
    }
  ]

  let validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('fail')

  commits[0].commit.message = 'feat: this'

  validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('pass')
})

test('oldest_only sub option', async () => {
  const commit = new Commit()
  const settings = {
    do: 'commit',
    message: {
      regex: 'feat:',
      oldest_only: true
    }
  }
  const date = Date.now()
  const commits = [
    {
      commit: {
        author: {
          date
        },
        message: 'fix: this'
      }
    },
    {
      commit: {
        author: {
          date: date + 1
        },
        message: 'fix: that'
      }
    }
  ]

  let validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('fail')

  commits[0].commit.message = 'feat: this'

  validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('pass')
})

test('newest_only sub option', async () => {
  const commit = new Commit()
  const settings = {
    do: 'commit',
    message: {
      regex: 'feat:',
      newest_only: true
    }
  }
  const date = Date.now()
  const commits = [
    {
      commit: {
        author: {
          date
        },
        message: 'fix: that'
      }
    },
    {
      commit: {
        author: {
          date: date + 1
        },
        message: 'fix: this'
      }
    }
  ]

  let validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('fail')

  commits[1].commit.message = 'feat: this'

  validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('pass')
})

test('skip_merge sub option', async () => {
  const commit = new Commit()
  const settings = {
    do: 'commit',
    message: {
      regex: 'feat:',
      skip_merge: false
    }
  }
  const date = Date.now()
  const commits = [
    {
      commit: {
        author: {
          date
        },
        message: 'feat: this'
      }
    },
    {
      commit: {
        author: {
          date: date + 1
        },
        message: 'Merge branch'
      }
    }
  ]

  let validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('fail')

  settings.message.skip_merge = true
  validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('pass')
})

test('single_commit_only sub option', async () => {
  const commit = new Commit()
  const settings = {
    do: 'commit',
    message: {
      regex: 'feat:',
      single_commit_only: true
    }
  }
  const date = Date.now()
  const commits = [
    {
      commit: {
        author: {
          date
        },
        message: 'fix: this'
      }
    },
    {
      commit: {
        author: {
          date: date + 1
        },
        message: 'test'
      }
    }
  ]

  let validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('pass')
  expect(validation.validations[0].description).toBe('Since there are more than one commits, Skipping validation')

  commits.pop()
  validation = await commit.processValidate(createMockContext(commits), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('Some or all of your commit messages doesn\'t meet the criteria')
})

const createMockContext = (commits) => {
  return Helper.mockContext({ commits })
}
