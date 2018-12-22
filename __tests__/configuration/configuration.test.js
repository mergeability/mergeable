const Configuration = require('../../lib/configuration/configuration')

describe('config file fetching', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = 'flex'
  })

  test('fetch from main branch if event is not pull_request', async () => {
    let configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: PR test
        `

    let context = createMockGhConfig(configString)
    let file = await Configuration.fetchConfigFile(context)
    const content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(configString)
  })

  test('fetch from main branch if the event is pull_request and file is not modified', async () => {
    let configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: PR test
        `
    let prConfig = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
        `
    let context = createMockGhConfig(configString, prConfig, { files: ['someFile'] })
    context.event = 'pull_request'
    let file = await Configuration.fetchConfigFile(context)
    const content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(configString)
  })

  test('fetch from head branch if the event is pull_request and file is modified', async () => {
    let configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: PR test
        `
    let prConfig = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
        `
    let context = createMockGhConfig(configString, prConfig, { files: ['.github/mergeable.yml'] })
    context.event = 'pull_request'
    let file = await Configuration.fetchConfigFile(context)
    const content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(prConfig)
  })
})

describe('with version 2', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = 'flex'
  })

  test('it loads correctly without version', () => {
    let config = new Configuration()
    expect(config.settings[0].when).toBeDefined()
    expect(config.settings[0].validate).toBeDefined()
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

describe('with version 1', () => {
  beforeEach(() => {
    process.env.MERGEABLE_VERSION = 'flex'
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

    let validate = config.settings[0].validate

    expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
    expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
    expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
  })

  test('that defaults load correctly when mergeable is null', () => {
    let config = new Configuration(`mergeable:`)
    let validate = config.settings[0].validate

    expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe(Configuration.DEFAULTS.title)
    expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe(Configuration.DEFAULTS.label)
    expect(validate.find(e => e.do === 'stale').message).toBe(Configuration.DEFAULTS.stale.message)
  })

  test('that defaults load correctly when mergeable has partial properties defined', () => {
    let config = new Configuration(`
      mergeable:
        approvals: 1
      `)
    let validate = config.settings[0].validate
    expect(validate.find(e => e.do === 'approvals').min.count).toBe(1)
    expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe(Configuration.DEFAULTS.title)
    expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe(Configuration.DEFAULTS.label)
  })

  test('that instanceWithContext returns the right Configuration', async () => {
    let context = createMockGhConfig(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)

    Configuration.instanceWithContext(context).then(config => {
      let validate = config.settings[0].validate
      expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (pull_requests)', async () => {
    let context = createMockGhConfig(`
      mergeable:
        pull_requests:
          label: 'label pull regex'
          title: 'title pull regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('pull_request.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title pull regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label pull regex')
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
      let validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('issues.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title issue regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label issue regex')
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
      let validate = config.settings[0].validate
      expect(validate.find(e => e.do === 'stale') !== undefined).toBe(true)
      expect(validate.find(e => e.do === 'stale').days).toBe(20)
      expect(validate.find(e => e.do === 'stale').message).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      mergeable:
        issues:
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      let validate = config.settings[0].validate
      expect(validate.find(e => e.do === 'stale') !== undefined).toBe(true)
      expect(validate.find(e => e.do === 'stale').days).toBe(20)
      expect(validate.find(e => e.do === 'stale').message).toBe(Configuration.DEFAULTS.stale.message)
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
      let issueValidate = config.settings[0].validate
      let pullValidate = config.settings[1].validate

      expect(config.settings[0].when).toBe('issues.*')
      expect(config.settings[1].when).toBe('pull_request.*')
      expect(issueValidate.find(e => e.do === 'stale') !== undefined).toBe(true)
      expect(issueValidate.find(e => e.do === 'stale').days).toBe(20)
      expect(issueValidate.find(e => e.do === 'stale').message).toBe('Issue test')
      expect(pullValidate.find(e => e.do === 'stale').message).toBe('PR test')
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
      let validate = config.settings[0].validate

      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe(Configuration.DEFAULTS.title)
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe(Configuration.DEFAULTS.label)
    }).catch(err => {
      /* global fail */
      fail('Should handle error: ' + err)
    })
    expect(context.github.repos.getContent.mock.calls.length).toBe(1)
  })
})

// helper method to return mocked configiration.
const createMockGhConfig = (json, prConfig, options) => {
  return {
    repo: jest.fn().mockReturnValue({
      repo: '',
      owner: ''
    }),
    payload: {
      pull_request: {
        number: 1,
        head: {
          ref: 1
        }
      }
    },
    github: {
      repos: {
        getContent: jest.fn(({ref}) => {
          return Promise.resolve({
            data: { content: ref ? Buffer.from(prConfig).toString('base64') : Buffer.from(json).toString('base64') }
          })
        })
      },
      pullRequests: {
        getFiles: () => {
          return { data: options.files && options.files.map(file => ({filename: file, status: 'modified'})) }
        }
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
