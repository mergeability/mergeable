const Author = require('../../../lib/filters/author')
const Helper = require('../../../__fixtures__/unit/helper')

test('should fail with unexpected author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: 'someone-else'
    }
  }
  const filter = await author.processFilter(createMockContext('mergeable'), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with expected author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: 'mergeable'
    }
  }
  const filter = await author.processFilter(createMockContext('mergeable'), settings)
  expect(filter.status).toBe('pass')
})

test('should fail with excluded author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_exclude: {
      regex: 'mergeable'
    }
  }
  const filter = await author.processFilter(createMockContext('mergeable'), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with excluded author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_exclude: {
      regex: 'someone-else'
    }
  }
  const filter = await author.processFilter(createMockContext('mergeable'), settings)
  expect(filter.status).toBe('pass')
})

const createMockContext = (author) => {
  return Helper.mockContext({ author })
}
