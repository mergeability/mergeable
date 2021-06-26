const And = require('../../../lib/filters/and')
const Helper = require('../../../__fixtures__/unit/helper')

describe('And Filter Unit Test', () => {
  let registry = { filters: new Map(), actions: new Map() }

  beforeEach(() => {
    registry = { filters: new Map(), actions: new Map() }
  })

  test('should run subtasks', async () => {
    const and = new And()
    const settings = {
      do: 'and',
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
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('fail')
  })

  test('should return output of second task if first fails', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: [
        {
          do: 'repository',
          topics: {
            must_include: {
              regex: 'Topic 2'
            }
          }
        },
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
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('fail')
  })

  test('should return output of first task to pass when multiple are given', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: [
        {
          do: 'repository',
          topics: {
            must_include: {
              regex: 'Topic 1'
            }
          }
        },
        {
          do: 'repository',
          topics: {
            must_exclude: {
              regex: 'Topic 2'
            }
          }
        }
      ]
    }
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('pass')
  })

  test('Error is returned when filter is missing', async () => {
    const and = new And()
    const settings = {
      do: 'and'
    }
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter is not an array', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: ''
    }
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter is empty', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: []
    }
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when filter uses unsupported classes', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: [
        { do: 'missing' }
      ]
    }
    const filter = await and.processFilter(createMockContext(['Topic 1']), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Supports nested and filter', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: [
        {
          do: 'or',
          filter: [
            {
              do: 'repository',
              topics: {
                must_include: {
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

    const filter = await and.processFilter(createMockContext(['Topic 2']), settings, registry)
    expect(filter.status).toBe('fail')
  })

  test('error if one of the sub filter errored', async () => {
    const and = new And()
    const settings = {
      do: 'and',
      filter: [
        {
          do: 'and',
          filter: [
            {
              do: 'repository',
              topics: {
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

    const filter = await and.processFilter(createMockContext(['Topic 2']), settings, registry)
    expect(filter.status).toBe('error')
  })
})

const createMockContext = (repoTopics = []) => {
  const context = Helper.mockContext({ repoTopics: repoTopics })
  return context
}
