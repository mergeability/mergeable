const Repository = require('../../../lib/filters/repository')
const Helper = require('../../../__fixtures__/unit/helper')

test('fail gracefully if invalid regex', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    topics: {
      must_exclude: {
        regex: '@#$@#$@#$'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['my-topic']), settings)
  expect(filter.status).toBe('pass')
})

test('public repo with private filter', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    visibility: 'private'
  }

  const filter = await repo.processFilter(mockContext(false, []), settings)
  expect(filter.status).toBe('fail')
})

test('public repo with public filter', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    visibility: 'public'
  }

  const filter = await repo.processFilter(mockContext(false, []), settings)
  expect(filter.status).toBe('pass')
})

test('private repo with public filter', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    visibility: 'public'
  }

  const filter = await repo.processFilter(mockContext(true, []), settings)
  expect(filter.status).toBe('fail')
})

test('private repo with private filter', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    visibility: 'private'
  }

  const filter = await repo.processFilter(mockContext(true, []), settings)
  expect(filter.status).toBe('pass')
})

test('must include topic', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    topics: {
      must_include: {
        regex: 'mytopic'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic']), settings)
  expect(filter.status).toBe('pass')
})

test('fail to must include topic', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    topics: {
      must_include: {
        regex: 'mytopic'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, []), settings)
  expect(filter.status).toBe('fail')
})

test('must exclude topic', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    topics: {
      must_exclude: {
        regex: 'mytopic'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, []), settings)
  expect(filter.status).toBe('pass')
})

test('fail to must exclude topic', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    topics: {
      must_exclude: {
        regex: 'mytopic'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic']), settings)
  expect(filter.status).toBe('fail')
})

test('fail to must include name', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    name: {
      must_include: {
        regex: 'test-repo-2'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic'], 'test-repo'), settings)
  expect(filter.status).toBe('fail')
})

test('must_include name passes', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    name: {
      must_include: {
        regex: 'test-repo-2'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic'], 'test-repo-2'), settings)
  expect(filter.status).toBe('pass')
})

test('fail to must exclude name', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    name: {
      must_exclude: {
        regex: 'test-repo'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic'], 'test-repo'), settings)
  expect(filter.status).toBe('fail')
})

test('must_exclude name passes', async () => {
  const repo = new Repository()

  const settings = {
    do: 'repository',
    name: {
      must_exclude: {
        regex: 'test-repo'
      }
    }
  }

  const filter = await repo.processFilter(mockContext(true, ['mytopic'], 'not-desired-repo-2'), settings)
  expect(filter.status).toBe('pass')
})

const mockContext = (repoPrivate, repoTopics, repoName) => {
  const context = Helper.mockContext({ repoPrivate: repoPrivate, repoTopics: repoTopics, repoName: repoName })
  return context
}
