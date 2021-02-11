const yaml = require('js-yaml')
const _ = require('lodash')
const NodeCache = require('node-cache')

const settingsCache = new NodeCache({ stdTTL: 0, maxKeys: 5000 })

class Settings {
  constructor (settings) {
    this.errors = new Map()
    this.warnings = new Map()
    if (settings === undefined) {
      return // intentionally return since there's not much more we can do.
    }

    if (!this.settings || !this.settings.mergeable) {
      this.settings = { mergeable: {} }
    }

    this.settings = settings
    this.validate()
    if (this.errors.size > 0) return

    const version = this.checkSettingsVersion()

    this.settings = (require(`./transformers/v${version}Settings`).transform(this.settings))

    // Cache the settings after defaults have been placed
    if (process.env.USE_SETTINGS_CACHE !== undefined && process.env.USE_SETTINGS_CACHE === 'true') {
      cache.set(`${repo.owner}/${repo.repo}/settings`, this.settings)
    }

    return this.settings.mergeable
  }

  validate () {
    if (this.settings.version && typeof this.settings.version !== 'number') {
      this.errors.set(
        ERROR_CODES.UNKOWN_VERSION,
        ERROR_MESSAGES.UNKNOWN_VERSION
      )
    }

    if (this.settings.mergeable === undefined) {
      this.errors.set(
        ERROR_CODES.MISSING_MERGEABLE_NODE,
        ERROR_MESSAGES.MISSING_MERGEABLE_NODE
      )
      return
    }

    if (this.settings.mergeable === null) {
      this.errors.set(
        ERROR_CODES.MISSING_SETTINGS,
        ERROR_MESSAGES.MISSING_SETTINGS
      )
    }
  }

  checkSettingsVersion () {
    if (!this.settings || !this.settings.version) return 1
    return (this.settings.version)
  }

  static async resetCache (context, cache) {
    // Only update the settings cache in case there was a push
    // event that updated the settings file
    if (context.event !== 'push') return

    // if there is no head_commit, just skip
    if (_.isUndefined(context.payload.head_commit) || !context.payload.head_commit) return

    const addedFiles = context.payload.head_commit.added
    const modifiedFiles = context.payload.head_commit.modified

    const settingsPath = process.env.SETTINGS_PATH ? process.env.SETTINGS_PATH : 'mergeable.settings.yml'
    if (!(addedFiles.includes(`.github/${settingsPath}`) || modifiedFiles.includes(`.github/${settingsPath}`))) return
    const repo = context.repo()
    if (repo.repo === '.github') {
      cache.keys().filter(key => key.startsWith(`${repo.owner}/`)).map(key => cache.del(key))
    } else {
      cache.del(`${repo.owner}/${repo.repo}/settings`)
    }
  }

  static async fetchSettingsFile (context) {
    let octokit = context.octokit
    const repo = context.repo()

    // probotContext.settings loads settings from current repo or from a repo called
    // '.github' in the same organisation as a fallback. It returns the parsed YAML object.
    let settings = null
    const settingsPath = process.env.SETTINGS_PATH ? process.env.SETTINGS_PATH : 'mergeable.settings.yml'
    const cache = Settings.getCache()

    if (process.env.USE_SETTINGS_CACHE !== undefined && process.env.USE_SETTINGS_CACHE === 'true') {
      Settings.resetCache(context, cache)
      settings = cache.get(`${repo.owner}/${repo.repo}/settings`)
      if (settings) {
        return settings
      }
    }

    // First fetch the settings from organization
    settings = await octokit.repos.getContent({
      owner: repo.owner,
      repo: '.github',
      path: '.github/' + settingsPath
    }).then(response => {
      return yaml.safeLoad(Buffer.from(response.data.content, 'base64').toString())
    }).catch(err => {
      if (err.status === 404) {
        return null
      }
      throw err
    })

    // If Organization setting file is null, we will look for the repo
    if (settings == null) {
      settings = await octokit.repos.getContent({
        owner: repo.owner,
        repo: repo.repo,
        path: '.github/' + settingsPath
      }).then(response => {
        return yaml.safeLoad(Buffer.from(response.data.content, 'base64').toString())
      }).catch(err => {
        if (err.status === 404) {
          return null
        }
        throw err
      })
    }

    if (_.isUndefined(settings) || _.isNull(settings)) {
      settings = {
        version: 1,
        mergeable: {}
      }
    }

    return settings
  }

  static getCache () {
    return settingsCache
  }

  static instanceWithContext (context) {
    return Settings.fetchSettingsFile(context).then(settings => {
      return new Settings(settings)
    }).catch(error => {
      const settings = new Settings()
      if (error instanceof SettingsFileNotFoundException) {
        settings.errors.set(ERROR_CODES.NO_YML, 'No Settings File found')
      } else if (error instanceof yaml.YAMLException) {
        settings.errors.set(ERROR_CODES.BAD_YML, `Invalid YML format > ${error.message}`)
      } else {
        const errorMsg = `Github API Error occurred while fetching the settings file at ${Settings.FILE_NAME} \n Error from api: ${error}`
        settings.errors.set(ERROR_CODES.GITHUB_API_ERROR, errorMsg)
      }
      return settings
    })
  }
}

class SettingsFileNotFoundException extends Error {}

Settings.FILE_NAME = '.github/mergeable.settings.yml'
Settings.DEFAULTS = {
  stale: {
    message: 'There haven\'t been much activity here. This is stale. Is it still relevant? This is a friendly reminder to please resolve it. :-)'
  }
}
const ERROR_CODES = {
  BAD_YML: 10,
  MISSING_MERGEABLE_NODE: 20,
  UNKOWN_VERSION: 30,
  SETTINGS_NOT_FOUND: 40,
  GITHUB_API_ERROR: 50,
  NO_YML: 60,
  MISSING_SETTINGS: 70
}
Settings.ERROR_CODES = ERROR_CODES
const ERROR_MESSAGES = {
  MISSING_MERGEABLE_NODE: 'The `mergeable` node is missing.',
  MISSING_SETTINGS: '`mergeable` node does not contain any rule sets',
  UNKNOWN_VERSION: 'Invalid `version` found.'
}

module.exports = Settings
