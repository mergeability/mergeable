const Or = require('../../../lib/filters/or')
const Helper = require('../../../__fixtures__/unit/helper')

describe('Or Filter Unit Test', () => {
  let registry = { filters: new Map(), actions: new Map() }

  beforeEach(() => {
    registry = { filters: new Map(), actions: new Map() }
  })

  test('should run subtasks', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
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
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('fail')
  })

  test('should return output of second task if first fails', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
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
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('pass')
  })

  test('should return output of first task to pass when multiple are given', async () => {
    const or = new Or()
    const settings = {
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
    }
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('pass')
  })

  test('Error is returned when validate is missing', async () => {
    const or = new Or()
    const settings = {
      do: 'or'
    }
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when validate is not an array', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
      filter: ''
    }
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when validate is empty', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
      filter: []
    }
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Error is returned when validate uses unsupported classes', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
      filter: [
        { do: 'missing' }
      ]
    }
    let filter = await or.processFilter(createMockContext([ 'Topic 1' ]), settings, registry)
    expect(filter.status).toBe('error')
  })

  test('Supports nested or validator', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
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
              regex: 'Topic 3'
            }
          }
        }
      ]
    }

    let filter = await or.processFilter(createMockContext([ 'Topic 2' ]), settings, registry)
    expect(filter.status).toBe('pass')
  })

  test('error status if one of the sub validator errored', async () => {
    const or = new Or()
    const settings = {
      do: 'or',
      filter: [
        {
          do: 'or',
          filter: [
            {
              do: 'repository',
              topics: {
                must_incdlude: {
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
              regex: 'Topic 3'
            }
          }
        }
      ]
    }

    let filter = await or.processFilter(createMockContext([ 'Topic 2' ]), settings, registry)
    expect(filter.status).toBe('error')
  })
})

const createMockContext = (repoTopics = []) => {
  return Helper.mockContext({ repoTopics: repoTopics })
}
