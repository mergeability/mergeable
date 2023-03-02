const Author = require('../../../lib/filters/author')
const Helper = require('../../../__fixtures__/unit/helper')
const Teams = require('../../../lib/validators/options_processor/teams')

const authorName = 'mergeabletestauthorname'
const otherAuthorName = 'someone-else'

test('should fail with unexpected author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: otherAuthorName
    }
  }
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with expected author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: authorName
    }
  }
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('pass')
})

test('should fail with excluded author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_exclude: {
      regex: authorName
    }
  }
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('fail')
})

test('should pass with excluded author', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_exclude: {
      regex: otherAuthorName
    }
  }
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('pass')
})

test('should pass with expected author from correct team', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: authorName
    },
    team: 'org/team-slug'
  }
  Teams.extractTeamMemberships = jest.fn().mockReturnValue([authorName])
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('pass')
})

test('should fail with expected author from incorrect team', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: authorName
    },
    team: 'org/team-slug'
  }
  Teams.extractTeamMemberships = jest.fn().mockReturnValue([])
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('fail')
})

test('should fail with unexpected author from correct team', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    must_include: {
      regex: otherAuthorName
    },
    team: 'org/team-slug'
  }
  Teams.extractTeamMemberships = jest.fn().mockReturnValue([authorName])
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('fail')
})

test('should pass when the author is a member of the team', async () => {
  const author = new Author()
  const settings = {
    do: 'author',
    team: 'org/team-slug'
  }
  Teams.extractTeamMemberships = jest.fn().mockReturnValue([authorName])
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('pass')
})

test('should fail when the author is not a member of the team', async () => {
  const author = new Author()
  const authorName = 'mergeable'
  const settings = {
    do: 'author',
    team: 'org/team-slug'
  }
  Teams.extractTeamMemberships = jest.fn().mockReturnValue([otherAuthorName])
  const filter = await author.processFilter(createMockContext(authorName), settings)
  expect(filter.status).toBe('fail')
})

const createMockContext = (author) => {
  return Helper.mockContext({ author })
}
