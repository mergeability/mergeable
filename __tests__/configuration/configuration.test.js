const Configuration = require('../../lib/configuration/configuration')

describe('with flex', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = 'flex'
  })

  test('it loads correctly without version', () => {
    let config = new Configuration()
    expect(config.settings.mergeable[0].when).toBeDefined()
    expect(config.settings.mergeable[0].validate).toBeDefined()
  })

  test('it loads correctly with version specified with flex', () => {
    let config = new Configuration(`version: 2`)
    expect(config.settings.mergeable).toBe(undefined)
  })

  test('it throw error correctly with wrong version specified', () => {
    try {
      let config = new Configuration(`
      version: something
      mergeable:
      `)
      expect(config).toBeUndefinded()
    } catch (e) {
      expect(e.message).toBe(Configuration.UNKNOWN_VERSION_ERROR)
    }
  })
})

describe('without flex', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = ''
  })

  test('that Configuration validates root node in yml', () => {
    try {
      let config = new Configuration('nothing:')
      expect(config).toBeUndefined()
    } catch (e) {
      expect(e.message).toBe(Configuration.ERROR_INVALID_YML)
    }
  })

  // write test to test for bad yml
  test('that constructor loads settings correctly', () => {
    let config = new Configuration(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)

    let mergeable = config.settings.mergeable
    expect(mergeable.approvals).toBe(5)
    expect(mergeable.title).toBe('title regex')
    expect(mergeable.label).toBe('label regex')
  })

  test('that defaults load correctly when mergeable is null', () => {
    let config = new Configuration(`mergeable:`)
    let mergeable = config.settings.mergeable

    expect(mergeable.approvals).toBe(Configuration.DEFAULTS.approvals)
    expect(mergeable.title).toBe(Configuration.DEFAULTS.title)
    expect(mergeable.label).toBe(Configuration.DEFAULTS.label)
    expect(mergeable.exclude).toBe(undefined)
    expect(mergeable.stale).toBe(Configuration.DEFAULTS.stale)
  })

  test('that defaults load correctly when mergeable has partial properties defined', () => {
    let config = new Configuration(`
      mergeable:
        approvals: 1
      `)

    let mergeable = config.settings.mergeable
    expect(mergeable.approvals).toBe(1)
    expect(mergeable.title).toBe(Configuration.DEFAULTS.title)
    expect(mergeable.label).toBe(Configuration.DEFAULTS.label)
  })

  test('that instanceWithContext returns the right Configuration', async () => {
    let context = createMockGhConfig(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)

    Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.approvals).toBe(5)
      expect(mergeable.title).toBe('title regex')
      expect(mergeable.label).toBe('label regex')
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (pull_requrests)', async () => {
    let context = createMockGhConfig(`
      mergeable:
        pull_requests:
          label: 'label issue regex'
          title: 'title issue regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.title).toBe(undefined)
      expect(mergeable.label).toBe(undefined)
      expect(mergeable.pull_requests.title).toBe('title issue regex')
      expect(mergeable.pull_requests.label).toBe('label issue regex')
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (issues)', async () => {
    let context = createMockGhConfig(`
      mergeable:
        issues:
          label: 'label issue regex'
          title: 'title issue regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.title).toBe(undefined)
      expect(mergeable.label).toBe(undefined)
      expect(mergeable.issues.title).toBe('title issue regex')
      expect(mergeable.issues.label).toBe('label issue regex')
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext loads the configuration for stale correctly when specified for pull_requests and issues separately', async () => {
    let context = createMockGhConfig(`
      mergeable:
        pull_requests:
          label: 'label issue regex'
          title: 'title issue regex'
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.pull_requests.stale !== undefined).toBe(true)
      expect(mergeable.pull_requests.stale.days).toBe(20)
      expect(mergeable.pull_requests.stale.message).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      mergeable:
        issues:
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.issues.stale !== undefined).toBe(true)
      expect(mergeable.issues.stale.days).toBe(20)
      expect(mergeable.issues.stale.message).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      mergeable:
        issues:
          stale:
            days: 20
            message: Issue test
        pull_requests:
          stale:
            days: 20
            message: PR test
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.issues.stale !== undefined).toBe(true)
      expect(mergeable.issues.stale.days).toBe(20)
      expect(mergeable.issues.stale.message).toBe('Issue test')
      expect(mergeable.pull_requests.stale.message).toBe('PR test')
    })
  })

  test('that instanceWithContext still returns the Configuration when repo does not content mergeable.yml', async () => {
    let context = {
      repo: () => {
        return {repo: '', owner: ''}
      },
      payload: {
        pull_request: {
          number: 1
        }
      },
      github: {
        repos: {
          getContent: jest.fn().mockReturnValue(
            Promise.reject(
              new HttpError(
                '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
                404,
                'Not Found')
            )
          )
        }
      }
    }

    Configuration.instanceWithContext(context).then(config => {
      let mergeable = config.settings.mergeable
      expect(mergeable.approvals).toBe(Configuration.DEFAULTS.approvals)
      expect(mergeable.title).toBe(Configuration.DEFAULTS.title)
      expect(mergeable.label).toBe(Configuration.DEFAULTS.label)
    }).catch(err => {
      /* global fail */
      fail('Should handle error: ' + err)
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })
})

// helper method to return mocked configiration.
const createMockGhConfig = (json) => {
  return {
    repo: jest.fn().mockReturnValue({
      repo: '',
      owner: ''
    }),
    payload: {
      pull_request: {
        number: 1
      }
    },
    github: {
      repos: {
        getContent: jest.fn().mockReturnValue(
          Promise.resolve({
            data: { content: Buffer.from(json).toString('base64') }
          })
        )
      }
    }
  }
}

// to mimic HttpError (https://github.com/octokit/rest.js/blob/fc8960ccf3415b5d77e50372d3bb873cfec80c55/lib/request/http-error.js)
class HttpError extends Error {
  constructor (message, code, status) {
    super(message)
    this.message = message
    this.code = code
    this.status = status
  }
}
