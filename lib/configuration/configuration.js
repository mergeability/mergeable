const yaml = require('js-yaml')
const _ = require('lodash')

class Configuration {
  constructor (settings) {
    this.errors = new Map()
    this.warnings = new Map()
    if (settings === undefined) {
      this.errors.set(ERROR_CODES.NO_YML, `No Config File found`)
      return // intentionally return since there's not much more we can do.
    }

    try {
      this.settings = yaml.safeLoad(settings)
    } catch (e) {
      this.errors.set(ERROR_CODES.BAD_YML, `Invalid YML format > ${e.message}`)
      return // intentionally return since there's not much more we can do.
    }

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

  static async fetchConfigFile (context) {
    let github = context.github
    let repo = context.repo()

    if (['pull_request', 'pull_request_review'].includes(context.event)) {
      // get modified file list
      let result = await context.github.pulls.listFiles(context.repo({pull_number: context.payload.pull_request.number}))
      let modifiedFiles = result.data
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
        })
      }
    }

    return github.repos.getContents({
      owner: repo.owner,
      repo: repo.repo,
      path: Configuration.FILE_NAME
    })
  }

  static instanceWithContext (context) {
    return Configuration.fetchConfigFile(context).then(res => {
      let content = Buffer.from(res.data.content, 'base64').toString()
      return new Configuration(content)
    }).catch(error => {
      let config = new Configuration()
      if (error.status === 404) {
        config.warnings.set(WARNING_CODES.CONFIG_NOT_FOUND, WARNING_CONFIG_NOT_FOUND)
      } else {
        const errorMsg = `Github API Error occurred while fetching the config file at ${Configuration.FILE_NAME} \n Error from api: ${error}`
        config.errors.set(ERROR_CODES.GITHUB_API_ERROR, errorMsg)
      }
      return config
    })
  }
}

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

const WARNING_CODES = {
  CONFIG_NOT_FOUND: 10
}
Configuration.WARNING_CODES = WARNING_CODES

const WARNING_CONFIG_NOT_FOUND = `Configuration file was not found in \`${Configuration.FILE_NAME}\``

module.exports = Configuration
