const Not = require('../../../lib/filters/not')
const Helper = require('../../../__fixtures__/unit/helper')

describe('Not Filter Unit Test', () => {
  let registry = { filters: new Map(), actions: new Map() }

  beforeEach(() => {
    registry = { filters: new Map(), actions: new Map() }
  })

  test('Should pass if subtasks fails', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: [
        {
          do: 'repository',
          topics: {
            must_include: {
              regex: 'Topic 2'
            }
          }
        }
      ]
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('pass')
  })

  test('Should fail if subtasks passes', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: [
        {
          do: 'repository',
          topics: {
            must_include: {
              regex: 'Topic 1'
            }
          }
        }
      ]
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('fail')
  })

  test('Error is returned when filter has more than one item', async () => {
    // TODO
    const not = new Not()
    const settings = {
      do: 'not'
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter is missing', async () => {
    const not = new Not()
    const settings = {
      do: 'not'
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter is not an array', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: ''
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter is empty', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: []
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter uses unsupported classes', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: [
        { do: 'missing' }
      ]
    }
    const filter = await not.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error if one of the sub filters errored', async () => {
    const not = new Not()
    const settings = {
      do: 'not',
      filter: [
        {
          do: 'not',
          filter: [
            {
              do: 'repository',
              topics: {
                // invalid syntax => error
                must_inclxude: {
                  regex: 'Topic 1'
                }
              }
            },
            {
              do: 'repository',
              topics: {
                must_include: {
                  regex: 'Topic 2'
                }
              }
            }
          ]
        },
        {
          do: 'repository',
          topics: {
            must_include: {
              regex: 'Version 3'
            }
          }
        }
      ]
    }

    const filter = await not.processFilter(createMockContext(['Topic 2']), settings, registry)
    expect(filter.status).toBe('error')
  })
})

const createMockContext = (repoTopics = []) => {
  const context = Helper.mockContext({ repoTopics: repoTopics })
  return context
}
