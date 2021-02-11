const yaml = require('js-yaml')
const Helper = require('../../../__fixtures__/unit/helper')
const Settings = require('../../../lib/settings/settings')

describe('Loading bad settings', () => {
  test('bad YML', async () => {
    const context = createMockGhSettings()
    context.octokit.repos.getContent = jest.fn().mockImplementation(() => {
      throw new yaml.YAMLException('Bad YML')
    })

    const settings = await Settings.instanceWithContext(context)

    expect(settings.errors.size).toBe(1)
    expect(settings.errors.has(Settings.ERROR_CODES.BAD_YML)).toBe(true)
  })

  test('No YML', async () => {
    const parsedSettings = yaml.safeLoad(`
        config_path: ""
        use_config_cache: false
        use_org_as_default_config: false
        use_config_from_pull_request: true
    `)

    const context = createMockGhSettings()
    context.octokit.repos.getContent = jest.fn().mockReturnValue(
      Promise.reject(
        new HttpError(
          '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
          404,
          404)
      )
    )

    const settings = await Settings.instanceWithContext(context)
    expect(settings).toEqual(parsedSettings)
  })

  test('wrong version', () => {
    const yamlContent = yaml.safeLoad(`
      version: not a number
      mergeable:
        config_path: ""
        use_config_cache: false
        use_org_as_default_config: false
        use_config_from_pull_request: true
    `)
    const settings = new Settings(yamlContent)
    expect(settings.errors.size).toBe(1)
    expect(settings.errors.has(Settings.ERROR_CODES.UNKOWN_VERSION)).toBe(true)
  })

  test('missing mergeable node', () => {
    const yamlContent = yaml.safeLoad(`
      version: 1
    `)
    const settings = new Settings(yamlContent)
    expect(settings.errors.size).toBe(1)
    expect(settings.errors.has(Settings.ERROR_CODES.MISSING_MERGEABLE_NODE)).toBe(true)
  })

  test('missing rule sets', () => {
    const yamlContent = yaml.safeLoad(`
      version: 1
      mergeable:
    `)
    const settings = new Settings(yamlContent)
    expect(settings.errors.size).toBe(1)
    expect(settings.errors.has(Settings.ERROR_CODES.MISSING_SETTINGS)).toBe(true)
  })
})

describe('settings file fetching', () => {
  afterAll(() => {
    process.env = {} // clean up env
  })

  test('fetch the settings from first repo', async () => {
    const settingsString = `
          mergeable:
            config_path: ""
            use_config_cache: false
            use_org_as_default_config: false
            use_config_from_pull_request: true
        `

    const parsedSettings = yaml.safeLoad(settingsString)
    const context = createMockGhSettings(settingsString)
    const settings = await Settings.fetchSettingsFile(context)
    expect(settings).toEqual(parsedSettings)
  })

  test('check settings cache', async () => {
    const settingsString = `
          mergeable:
            config_path: ""
            use_config_cache: false
            use_org_as_default_config: false
            use_config_from_pull_request: true
        `

    const parsedSettings = yaml.safeLoad(settingsString)
    const context = createMockGhSettings(settingsString)
    process.env.USE_SETTINGS_CACHE = true

    const settingsCache = Settings.getCache()
    const repo = context.repo()
    // checking that the cache is empty before the call
    expect(settingsCache.keys().length).toEqual(0)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(0)
    const settings = await Settings.fetchSettingsFile(context)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(1)
    expect(settings).toEqual(parsedSettings)
    // checking that the cache is warmed up
    expect(settingsCache.keys().length).toEqual(1)
    expect(settingsCache.get(`${repo.owner}/${repo.repo}/settings`)).toEqual(parsedSettings)
    // checking that we are only fetching it once, even though we call it twice
    const cachedSettings = await Settings.fetchSettingsFile(context)
    expect(cachedSettings).toEqual(parsedSettings)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(1)
  })

  test('check settings cache fetch', async () => {
    const settingsString = `
          mergeable:
            config_path: ""
            use_config_cache: false
            use_org_as_default_config: false
            use_config_from_pull_request: true
        `
    // intialize context with empty config
    const parsedSettings = yaml.safeLoad(settingsString)
    const context = createMockGhSettings(settingsString)
    process.env.USE_SETTINGS_CACHE = true

    const settingsCache = Settings.getCache()
    const repo = context.repo()
    settingsCache.set(`${repo.owner}/${repo.repo}/settings`, parsedSettings)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(0)
    const settings = await Settings.fetchSettingsFile(context)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(0)
    expect(settings).toEqual(parsedSettings)
  })

  test('check settings cache invalidated on push events', async () => {
    const settingsString = `
          version: 1
          mergeable:
            config_path: ""
            use_config_cache: false
            use_org_as_default_config: false
            use_config_from_pull_request: true
        `

    // intialize context with empty config
    let emptyConfig = '{}'
    const parsedSettings = yaml.safeLoad(settingsString)
    let context = createMockGhSettings(emptyConfig)
    process.env.USE_SETTINGS_CACHE = true
    let settingsCache = Settings.getCache()
    let repo = context.repo()
    settingsCache.set(`${repo.owner}/${repo.repo}/settings`, parsedSettings)
    context.event = 'push'
    context.payload.head_commit = { added: ['.github/mergeable.settings.yml'] }
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(0)
    const settings = await Settings.fetchSettingsFile(context)
    expect(context.octokit.repos.getContent.mock.calls.length).toEqual(1)
    expect(settings).toEqual(parsedSettings)
    expect(settingsCache.keys().length).toEqual(1)
  })
})

// helper method to return mocked settings.
const createMockGhSettings = (settings, options) => {
  const context = Helper.mockContext(options)

  context.octokit.repos.getContent = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        content: Buffer.from(settings).toString('base64')
      }
    })
  })
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
