const yaml = require('js-yaml')
const _ = require('lodash')
const NodeCache = require('node-cache')

const configCache = new NodeCache({ stdTTL: 0, maxKeys: 5000 })

class Configuration {
  constructor (settings) {
    this.errors = new Map()
    this.warnings = new Map()
    if (settings === undefined) {
      return // intentionally return since there's not much more we can do.
    }

    this.settings = settings
    this.validate()
    if (this.errors.size > 0) return

    const version = this.checkConfigVersion()

    this.settings = (require(`./transformers/v${version}Config`).transform(this.settings))
    this.settings = this.settings.mergeable
  }

  hasErrors () {
    return (this.errors.size > 0)
  }

  checkConfigVersion () {
    if (!this.settings.version) return 1
    return (this.settings.version)
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
        ERROR_CODES.MISSING_RULE_SETS,
        ERROR_MESSAGES.MISSING_RULE_SETS
      )
      return
    }

    if (this.checkConfigVersion() === 2) {
      if (!_.isArray(this.settings.mergeable)) {
        this.errors.set(
          ERROR_CODES.NON_ARRAY_MERGEABLE,
          ERROR_MESSAGES.NON_ARRAY_MERGEABLE
        )
        return
      }

      this.settings.mergeable.forEach(ruleSet => {
        if (_.isUndefined(ruleSet.when)) {
          this.errors.set(
            ERROR_CODES.MISSING_WHEN_KEYWORD,
            ERROR_MESSAGES.MISSING_WHEN_KEYWORD
          )
        }
        if (_.isUndefined(ruleSet.validate)) {
          this.errors.set(
            ERROR_CODES.MISSING_VALIDATE_KEYWORD,
            ERROR_MESSAGES.MISSING_VALIDATE_KEYWORD
          )
          return
        }

        if (!_.isArray(ruleSet.validate)) {
          this.errors.set(
            ERROR_CODES.NON_ARRAY_VALIDATE,
            ERROR_MESSAGES.NON_ARRAY_VALIDATE
          )
        }
      })
    }
  }

  static async resetCache (context, cache) {
    // Only update the config cache in case there was a push
    // event that updated the config file
    if (context.event !== 'push') return

    // if there is no head_commit, just skip
    if (_.isUndefined(context.payload.head_commit) || !context.payload.head_commit) return

    const addedFiles = context.payload.head_commit.added
    const modifiedFiles = context.payload.head_commit.modified

    const configPath = process.env.CONFIG_PATH ? process.env.CONFIG_PATH : 'mergeable.yml'
    if (!(addedFiles.includes(`.github/${configPath}`) || modifiedFiles.includes(`.github/${configPath}`))) return
    const repo = context.repo()
    if (repo.repo === '.github') {
      cache.keys().filter(key => key.startsWith(`${repo.owner}/`)).map(key => cache.del(key))
    } else {
      cache.del(`${repo.owner}/${repo.repo}`)
    }
  }

  static async fetchConfigFile (context) {
    let github = context.github
    let repo = context.repo()
    if (['pull_request', 'pull_request_review'].includes(context.event)) {
      let payload = context.payload['pull_request']
      // If the pull request is from a fork, don't read the config as it
      // may be malicious
      // As a result here we only load the config if the PR is from the same repo
      // as the base
      if (payload.head.repo.full_name === payload.base.repo.full_name) {
        let result = await context.github.paginate(
          context.github.pulls.listFiles.endpoint.merge(
            context.repo({ pull_number: context.payload.pull_request.number })
          ),
          res => res.data
        )

        // get modified file list
        let modifiedFiles = result
          .filter(file => ['modified', 'added'].includes(file.status))
          .map(file => file.filename)

        // check if config file is in that list
        if (modifiedFiles.includes(Configuration.FILE_NAME)) {
          // if yes return, return below else do nothing
          return github.repos.getContents({
            owner: repo.owner,
            repo: repo.repo,
            path: Configuration.FILE_NAME,
            ref: context.payload.pull_request.head.sha
          }).then(response => {
            return yaml.safeLoad(Buffer.from(response.data.content, 'base64').toString())
          })
        }
      }
    }

    // probotContext.config loads config from current repo or from a repo called
    // '.github' in the same organisation as a fallback. It returns the parsed YAML object.
    let config = null
    const configPath = process.env.CONFIG_PATH ? process.env.CONFIG_PATH : 'mergeable.yml'
    if (process.env.USE_CONFIG_CACHE) {
      const cache = Configuration.getCache()
      Configuration.resetCache(context, cache)
      config = cache.get(`${repo.owner}/${repo.repo}`)
      if (_.isUndefined(config)) {
        config = await context.probotContext.config(configPath)
        cache.set(`${repo.owner}/${repo.repo}`, config)
      }
    } else {
      config = await context.probotContext.config(configPath)
    }
    if (_.isUndefined(config) || _.isNull(config)) {
      throw new ConfigFileNotFoundException('Could not find config file.')
    }

    return config
  }

  static getCache () {
    return configCache
  }

  static instanceWithContext (context) {
    return Configuration.fetchConfigFile(context).then(config => {
      return new Configuration(config)
    }).catch(error => {
      let config = new Configuration()
      if (error instanceof ConfigFileNotFoundException) {
        config.errors.set(ERROR_CODES.NO_YML, `No Config File found`)
      } else if (error instanceof yaml.YAMLException) {
        config.errors.set(ERROR_CODES.BAD_YML, `Invalid YML format > ${error.message}`)
      } else {
        const errorMsg = `Github API Error occurred while fetching the config file at ${Configuration.FILE_NAME} \n Error from api: ${error}`
        config.errors.set(ERROR_CODES.GITHUB_API_ERROR, errorMsg)
      }
      return config
    })
  }
}

class ConfigFileNotFoundException extends Error {}

Configuration.FILE_NAME = '.github/mergeable.yml'
Configuration.DEFAULTS = {
  stale: {
    message: 'There haven\'t been much activity here. This is stale. Is it still relevant? This is a friendly reminder to please resolve it. :-)'
  }
}
const ERROR_CODES = {
  BAD_YML: 10,
  MISSING_MERGEABLE_NODE: 20,
  UNKOWN_VERSION: 30,
  CONFIG_NOT_FOUND: 40,
  GITHUB_API_ERROR: 50,
  NO_YML: 60,
  MISSING_RULE_SETS: 70,
  NON_ARRAY_MERGEABLE: 80,
  MISSING_WHEN_KEYWORD: 90,
  MISSING_VALIDATE_KEYWORD: 100,
  NON_ARRAY_VALIDATE: 110
}
Configuration.ERROR_CODES = ERROR_CODES
const ERROR_MESSAGES = {
  MISSING_MERGEABLE_NODE: 'The `mergeable` node is missing.',
  MISSING_RULE_SETS: '`mergeable` node does not contain any rule sets',
  NON_ARRAY_MERGEABLE: '`mergeable` must be an array for version 2 config',
  MISSING_WHEN_KEYWORD: 'One or more rule set is missing `when` keyword',
  MISSING_VALIDATE_KEYWORD: 'One or more rule set is missing `validate` keyword',
  NON_ARRAY_VALIDATE: '`validate` must be an array of rules',
  UNKNOWN_VERSION: 'Invalid `version` found.'
}

module.exports = Configuration
