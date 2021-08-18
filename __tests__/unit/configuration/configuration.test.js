const yaml = require('js-yaml')
const Helper = require('../../../__fixtures__/unit/helper')
const Configuration = require('../../../lib/configuration/configuration')
const deepmerge = require('deepmerge')

describe('Loading bad configuration', () => {
  test('bad YML', async () => {
    const context = createMockGhConfig()
    context.probotContext.config = jest.fn().mockImplementation(() => {
      throw new yaml.YAMLException('Bad YML')
    })

    const config = await Configuration.instanceWithContext(context)

    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.BAD_YML)).toBe(true)
  })

  test('No YML found', async () => {
    const context = createMockGhConfig()
    context.probotContext.config = jest.fn().mockResolvedValue(null)
    const config = await Configuration.instanceWithContext(context)

    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.NO_YML)).toBe(true)
  })

  test('wrong version', () => {
    const settings = yaml.safeLoad(`
      version: not a number
      mergeable:
        pull_request:
    `)
    const config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.UNKOWN_VERSION)).toBe(true)
  })

  test('missing mergeable node', () => {
    const settings = yaml.safeLoad(`
      version: 2
    `)
    const config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_MERGEABLE_NODE)).toBe(true)
  })

  test('missing rule sets', () => {
    const settings = yaml.safeLoad(`
      version: 2
      mergeable:
    `)
    const config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_RULE_SETS)).toBe(true)
  })
  test('v2: non array rule set', () => {
    const settings = yaml.safeLoad(`
      version: 2
      mergeable:
        when: test
    `)

    const config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.NON_ARRAY_MERGEABLE)).toBe(true)
  })

  test('v2: missing/typo in "validate" keyword multiple rule sets', () => {
    let settings = yaml.safeLoad(`
      version: 2
      mergeable:
        - when: pull_requests.*
          validate:
            - do :
        - when: issues.*
          valdate:
    `)
    let config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_VALIDATE_KEYWORD)).toBe(true)

    settings = yaml.safeLoad(`
      version: 2
      mergeable:
        - when: pull_requests.*
    `)
    config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_VALIDATE_KEYWORD)).toBe(true)
  })

  test('v2: non-array "validate" node', () => {
    let settings = yaml.safeLoad(`
      version: 2
      mergeable:
        - when: pull_requests.*
          validate:
    `)
    let config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.NON_ARRAY_VALIDATE)).toBe(true)

    settings = yaml.safeLoad(`
      version: 2
      mergeable:
        - when: pull_requests.*
          validate:
            do : title
    `)
    config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.NON_ARRAY_VALIDATE)).toBe(true)
  })

  test('v2: missing/typo in "when" keyword rule sets', () => {
    const settings = yaml.safeLoad(`
      version: 2
      mergeable:
        - validate:
            - do :
    `)
    const config = new Configuration(settings)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_WHEN_KEYWORD)).toBe(true)
  })

  test('multiple errors', () => {
    const settings = yaml.safeLoad(`
      version: foo
      mergeably:
        when: bar
    `)
    const config = new Configuration(settings)
    expect(config.errors.size).toBe(2)
  })
})

describe('config file fetching', () => {
  afterAll(() => {
    process.env = {} // clean up env
  })

  test('fetch from main branch if event is not pull_request', async () => {
    const configString = `
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
    const parsedConfig = yaml.safeLoad(configString)
    const context = createMockGhConfig(configString)
    const config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)
  })

  test('check config cache', async () => {
    const configString = `
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
    const parsedConfig = yaml.safeLoad(configString)
    const context = createMockGhConfig(configString)
    context.globalSettings.use_config_cache = true
    const configCache = Configuration.getCache()
    const repo = context.repo()
    let keys = await configCache.keys()
    // checking that the cache is empty before the call
    expect(keys.length).toEqual(0)
    expect(context.probotContext.config.mock.calls.length).toEqual(0)
    const config = await Configuration.fetchConfigFile(context)
    expect(context.probotContext.config.mock.calls.length).toEqual(1)
    expect(config).toEqual(parsedConfig)
    keys = await configCache.keys()
    // checking that the cache is warmed up
    expect(keys.length).toEqual(1)
    expect(await configCache.get(`${repo.owner}/${repo.repo}`)).toEqual(parsedConfig)
    // checking that we are only fetching it once, even though we call it twice
    const cachedConfig = await Configuration.fetchConfigFile(context)
    expect(cachedConfig).toEqual(parsedConfig)
    expect(context.probotContext.config.mock.calls.length).toEqual(1)
  })

  test('check config cache fetch', async () => {
    const configString = `
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
    // intialize context with empty config
    const emptyConfig = '{}'
    const parsedConfig = yaml.safeLoad(configString)
    const context = createMockGhConfig(emptyConfig)
    context.globalSettings.use_config_cache = true
    const configCache = Configuration.getCache()
    const repo = context.repo()
    configCache.set(`${repo.owner}/${repo.repo}`, parsedConfig)
    expect(context.probotContext.config.mock.calls.length).toEqual(0)
    const config = await Configuration.fetchConfigFile(context)
    expect(context.probotContext.config.mock.calls.length).toEqual(0)
    expect(config).toEqual(parsedConfig)
  })

  test('check config cache invalidated on push events', async () => {
    const configString = `
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
    // intialize context with empty config
    const emptyConfig = '{}'
    const parsedConfig = yaml.safeLoad(configString)
    const context = createMockGhConfig(emptyConfig)
    context.globalSettings.use_config_cache = true
    const configCache = Configuration.getCache()
    const repo = context.repo()
    configCache.set(`${repo.owner}/${repo.repo}`, parsedConfig)
    context.eventName = 'push'
    context.payload.head_commit = { added: ['.github/mergeable.yml'] }
    expect(context.probotContext.config.mock.calls.length).toEqual(0)
    const config = await Configuration.fetchConfigFile(context)
    expect(context.probotContext.config.mock.calls.length).toEqual(1)
    expect(config).toEqual({})
    const keys = await configCache.keys()
    expect(keys.length).toEqual(1)
  })

  test('check config cache for org invalidated on push events', async () => {
    const configString = `
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
    // intialize context with empty config
    const emptyConfig = '{}'
    const parsedConfig = yaml.safeLoad(configString)
    const context = createMockGhConfig(emptyConfig)
    context.globalSettings.use_config_cache = true
    const configCache = Configuration.getCache()
    const repo = context.repo()
    configCache.set(`${repo.owner}/${repo.repo}`, parsedConfig)
    configCache.set(`${repo.owner}/another-repo`, parsedConfig)
    configCache.set(`${repo.owner}/yet-another-repo`, parsedConfig)
    let keys = await configCache.keys()
    expect(keys.length).toEqual(3)
    context.eventName = 'push'
    context.payload.head_commit = { added: ['.github/mergeable.yml'] }
    expect(context.probotContext.config.mock.calls.length).toEqual(0)
    let config = await Configuration.fetchConfigFile(context)
    expect(context.probotContext.config.mock.calls.length).toEqual(1)
    expect(config).toEqual({})
    keys = await configCache.keys()
    expect(keys.length).toEqual(3)
    context.repo = jest.fn().mockReturnValue({ owner: repo.owner, repo: '.github' })
    config = await Configuration.fetchConfigFile(context)
    expect(context.probotContext.config.mock.calls.length).toEqual(2)
    expect(config).toEqual({})
    keys = await configCache.keys()
    expect(keys.length).toEqual(1)
  })

  test('fetch from main branch if the event is PR relevant and file is not modified or added', async () => {
    const configString = `
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
    const prConfig = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
        `
    const parsedConfig = yaml.safeLoad(configString)

    const context = createMockGhConfig(
      configString,
      prConfig,
      { files: [{ filename: 'someFile', status: 'modified' }] }
    )

    context.eventName = 'pull_request'
    let config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    context.eventName = 'pull_request_review'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)
  })

  test('fetch from main branch if the event is PR relevant and PR is from a fork', async () => {
    const configString = `
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
    const prConfig = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
        `
    const parsedConfig = yaml.safeLoad(configString)

    const context = createMockGhConfig(
      configString,
      prConfig,
      { baseRepo: 'owner/test', headRepo: 'owner/not-test' }
    )

    context.eventName = 'pull_request'
    let config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    context.eventName = 'pull_request_review'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)
  })

  test('fetch from head branch if the event is relevant to PR and file is modified or added', async () => {
    const configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: from HEAD
        `
    const prConfigString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: From PR Config
        `
    const parsedConfig = yaml.safeLoad(prConfigString)
    let files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'modified' }
      ]
    }
    let context = createMockGhConfig(configString, prConfigString, files)
    context.eventName = 'pull_request'
    let config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    context.eventName = 'pull_request_review'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'added' }
      ]
    }
    context = createMockGhConfig(null, prConfigString, files)
    context.eventName = 'pull_request'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)
  })

  test('fetch from head branch if the event is relevant to PR and file is modified or added and cache is enabled', async () => {
    const configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: from HEAD
        `
    const prConfigString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: From PR Config
        `
    const parsedConfig = yaml.safeLoad(prConfigString)
    let files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'modified' }
      ]
    }
    let context = createMockGhConfig(configString, prConfigString, files)
    context.globalSettings.use_config_cache = true
    context.eventName = 'pull_request'
    let config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    context.eventName = 'pull_request_review'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)

    files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'added' }
      ]
    }
    context = createMockGhConfig(null, prConfigString, files)
    context.eventName = 'pull_request'
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(parsedConfig)
  })
})

describe('with version 2', () => {
  test('it loads correctly without version', () => {
    const configJson = yaml.safeLoad(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)
    const config = new Configuration(configJson)
    expect(config.settings[0].when).toBeDefined()
    expect(config.settings[0].validate).toBeDefined()
    expect(config.hasErrors()).toBe(false)
  })
})

describe('with version 1', () => {
  // write test to test for bad yml
  test('that constructor loads settings correctly', () => {
    const configJson = yaml.safeLoad(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)
    const config = new Configuration(configJson)

    const validate = config.settings[0].validate

    expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
    expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
    expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
  })

  test('that defaults are not injected when user defined configuration exists', () => {
    const configJson = yaml.safeLoad(`
      mergeable:
        approvals: 1
      `)
    const config = new Configuration(configJson)
    const validate = config.settings[0].validate
    expect(validate.find(e => e.do === 'approvals').min.count).toBe(1)
    expect(validate.find(e => e.do === 'title')).toBeUndefined()
    expect(validate.find(e => e.do === 'label')).toBeUndefined()
  })

  test('that instanceWithContext returns the right Configuration', async () => {
    const context = createMockGhConfig(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)
    context.probotContext.config = jest.fn().mockResolvedValue(yaml.safeLoad(`
      mergeable:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `))

    await Configuration.instanceWithContext(context).then(config => {
      const validate = config.settings[0].validate
      expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
    })

    expect(context.probotContext.config.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (pull_requests)', async () => {
    const context = createMockGhConfig(`
      mergeable:
        pull_requests:
          label: 'label pull regex'
          title: 'title pull regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      const validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('pull_request.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title pull regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label pull regex')
    })
    expect(context.probotContext.config.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (issues)', async () => {
    const context = createMockGhConfig(`
      mergeable:
        issues:
          label: 'label issue regex'
          title: 'title issue regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      const validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('issues.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title issue regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label issue regex')
    })
    expect(context.probotContext.config.mock.calls.length).toBe(1)
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
      const when = config.settings[2]
      expect(when.validate[0].do).toBe('stale')
      expect(when.validate[0].days).toBe(20)
      expect(when.pass[0].do).toBe('comment')
      expect(when.pass[0].payload.body).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      mergeable:
        issues:
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      const when = config.settings[1]
      expect(when.validate[0].do).toBe('stale')
      expect(when.validate[0].days).toBe(20)
      expect(when.pass[0].do).toBe('comment')
      expect(when.pass[0].payload.body).toBe(Configuration.DEFAULTS.stale.message)
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
      const issueWhen = config.settings[1]
      const pullWhen = config.settings[4]

      expect(issueWhen.when).toBe('schedule.repository')
      expect(pullWhen.when).toBe('schedule.repository')
      expect(issueWhen.validate[0].do).toBe('stale')
      expect(issueWhen.validate[0].days).toBe(20)
      expect(issueWhen.pass[0].do).toBe('comment')
      expect(issueWhen.pass[0].payload.body).toBe('Issue test')
      expect(pullWhen.validate[0].do).toBe('stale')
      expect(pullWhen.validate[0].days).toBe(20)
      expect(pullWhen.pass[0].do).toBe('comment')
      expect(pullWhen.pass[0].payload.body).toBe('PR test')
    })
  })

  test('that instanceWithContext return error if mergeable.yml is not found', async () => {
    const context = {
      repo: () => {
        return { repo: '', owner: '' }
      },
      payload: {
        pull_request: {
          number: 1
        }
      },
      probotContext: {
        config: jest.fn().mockResolvedValue(null)
      }
    }

    context.globalSettings = {
      use_config_from_pull_request: true,
      use_config_cache: false,
      use_org_as_default_config: false
    }

    const config = await Configuration.instanceWithContext(context)
    expect(config.hasErrors()).toBe(true)
    expect(config.errors.has(Configuration.ERROR_CODES.NO_YML)).toBe(true)
  })

  test('that instanceWithContext return error if mergeable.yml is not found on PRs', async () => {
    const prConfigString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: From PR Config
        `
    const files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'modified' }
      ]
    }
    const context = createMockGhConfig(null, prConfigString, files)
    context.eventName = 'pull_request'
    context.octokit.repos.getContent = jest.fn().mockReturnValue(
      Promise.reject(
        new HttpError(
          '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
          404,
          'Not Found')
      )
    )

    const config = await Configuration.instanceWithContext(context)
    expect(config.hasErrors()).toBe(true)
    expect(config.errors.has(Configuration.ERROR_CODES.GITHUB_API_ERROR)).toBe(true)
  })

  test('that if pass, fail or error is undefined in v2 config, the config will not break', async () => {
    const settings = yaml.safeLoad(`
      mergeable:
        issues:
          stale:
            days: 30
            message: 'There has not been any activity in the past month. Is there anything to follow-up?'
    `)

    const config = new Configuration(settings)

    expect(config.settings.length).toBe(2)
    expect(config.settings[0].fail).toBeDefined()
    expect(config.settings[0].error).toBeDefined()
  })

  test('that fetchConfigFile returns the right Configuration depending on USE_CONFIG_FROM_PULL_REQUEST env', async () => {
    const configString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: From HEAD Config
        `
    const prConfigString = `
          mergeable:
            issues:
              stale:
                days: 20
                message: From PR Config
        `
    const files = {
      files: [
        { filename: '.github/mergeable.yml', status: 'modified' }
      ]
    }

    const context = createMockGhConfig(configString, prConfigString, files)
    context.eventName = 'pull_request'

    let config = null

    context.globalSettings.use_config_from_pull_request = false
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(yaml.safeLoad(configString))

    context.globalSettings.use_config_from_pull_request = true
    config = await Configuration.fetchConfigFile(context)
    expect(config).toEqual(yaml.safeLoad(prConfigString))
  })

  test('that env USE_ORG_AS_DEFAULT_CONFIG correctly use org-wide config', async () => {
    const repoConfig = `
      version: 2
      mergeable:
        - when: pull_request.*, pull_request_review.*
          name: 'repository rules'
          validate:
            - do: title
              must_include:
                regex: 'something'`

    const orgConfig = `
      version: 2
      mergeable:
        - when: pull_request.*, pull_request_review.*
          name: 'organization rules'
          validate:
            - do: title
              must_include:
                regex: 'nothing'`

    const context = createMockGhConfig(repoConfig, orgConfig)
    context.event = 'pull_request'

    let config = null

    context.globalSettings.use_org_as_default_config = true
    context.globalSettings.use_config_cache = true
    config = await Configuration.fetchConfigFile(context)
    expect(config.mergeable.length).toEqual(2)
    expect(config.mergeable[0].name).toBe('repository rules')
    expect(config.mergeable[1].name).toBe('organization rules')

    context.globalSettings.use_org_as_default_config = false
    context.globalSettings.use_config_cache = false
    config = await Configuration.fetchConfigFile(context)
    expect(config.mergeable.length).toEqual(1)
    expect(config.mergeable[0].name).toBe('repository rules')
  })
})

// helper method to return mocked configiration.
const createMockGhConfig = (config, prConfig, options) => {
  const context = Helper.mockContext(options)

  context.octokit.repos.getContent = () => {
    return Promise.resolve({
      data: { content: Buffer.from(prConfig).toString('base64') }
    })
  }
  context.probotContext.config = jest.fn().mockImplementation((fileName, defaultConfig, deepMergeOptions) => {
    if (defaultConfig) {
      const configs = [yaml.safeLoad(config), defaultConfig]
      return deepmerge.all(configs, deepMergeOptions)
    }
    return yaml.safeLoad(config)
  })

  context.globalSettings = {
    use_config_from_pull_request: true,
    use_config_cache: false,
    use_org_as_default_config: false
  }
  return context
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
