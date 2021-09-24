const Payload = require('../../../lib/filters/payload')

test('that checks are done against correct field', async () => {
  const payload = new Payload()

  const settings = {
    do: 'payload',
    review: {
      state: {
        must_include: {
          regex: 'changes_requested'
        }
      }
    }
  }

  let context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      review: {
        state: 'changes_requested',
        user: {
          login: 'reviewer_1'
        }
      }
    }
  }

  let filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('pass')

  context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      review: {
        state: 'approved',
        user: {
          login: 'reviewer_1'
        }
      }
    }
  }

  filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('fail')
})

test('that proper errors are returned if the field does not exist', async () => {
  const payload = new Payload()

  const settings = {
    do: 'payload',
    review: {
      non_existent_field: {
        must_include: {
          regex: 'yes'
        }
      }
    }
  }

  const context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      review: {
        state: 'changes_requested'
      }
    }
  }

  const filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('error')
})

test('that checks work against objects in an array with must_include', async () => {
  const payload = new Payload()

  const settings = {
    do: 'payload',
    pull_request: {
      labels: {
        must_include: {
          regex: 'foo',
          key: 'name'
        }
      }
    }
  }

  let context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      pull_request: {
        labels: [
          {
            name: 'foo'
          }
        ]
      }
    }
  }

  let filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('pass')

  context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      pull_request: {
        labels: [
          {
            name: 'bar'
          }
        ]
      }
    }
  }

  filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('fail')
})

test('that checks work against objects in an array with must_exclude', async () => {
  const payload = new Payload()

  const settings = {
    do: 'payload',
    pull_request: {
      labels: {
        must_exclude: {
          regex: 'foo',
          key: 'name'
        }
      }
    }
  }

  let context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      pull_request: {
        labels: [
          {
            name: 'bar'
          }
        ]
      }
    }
  }

  let filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('pass')

  context = {
    payload: {
      repository: {
        full_name: 'test-repo'
      },
      pull_request: {
        labels: [
          {
            name: 'foo'
          }
        ]
      }
    }
  }

  filter = await payload.processFilter(context, settings)
  expect(filter.status).toBe('fail')
})
