const yaml = require('js-yaml')
const consts = require('./lib/consts')

class Configuration {
  constructor (settings) {
    this.errors = new Map()
    this.warnings = new Map()
    if (settings === undefined) {
      this.settings = [{
        when: 'pull_request.*',
        validate: consts.DEFAULT_PR_VALIDATE,
        pass: consts.DEFAULT_PR_PASS,
        fail: consts.DEFAULT_PR_FAIL,
        error: consts.DEFAULT_PR_ERROR
      }]
    } else {
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
  }

  hasErrors () {
    return (this.errors.size > 0)
  }

  checkConfigVersion () {
    if (!this.settings.version) return 1
    return (this.settings.version)
  }

  registerValidatorsAndActions (registry) {
    this.settings.forEach(rule => {
      try {
        rule.validate.forEach(validation => {
          let key = validation.do

          if (!registry.validators.has(key)) {
            let Validator = require(`../validators/${key}`)
            registry.validators.set(key, new Validator())
          }
        })
      } catch (err) {
        console.log(err)
        throw new Error('Validators have thrown ' + err)
      }
      try {
        let possibleActions = []
        let outcomesToCheck = [rule.pass, rule.fail, rule.error]

        outcomesToCheck.forEach(actions => {
          if (actions) {
            possibleActions = possibleActions.concat(actions)
          }
        })

        possibleActions.forEach(action => {
          let key = action.do
          if (!registry.actions.has(key)) {
            let Action = require(`../actions/${key}`)
            registry.actions.set(key, new Action())
          }
        })
      } catch (err) {
        console.log(err)
        throw new Error('Actions have thrown ' + err)
      }
    })
  }

  validate () {
    if (this.settings.mergeable === undefined) {
      this.errors.set(
        ERROR_CODES.MISSING_MERGEABLE_NODE,
        ERROR_MESSAGES.MISSING_MERGEABLE_NODE
      )
    }
    if (this.settings.version && typeof this.settings.version !== 'number') {
      this.errors.set(
        ERROR_CODES.UNKOWN_VERSION,
        ERROR_MESSAGES.UNKNOWN_VERSION
      )
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
      if (error.code === 404) {
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
  GITHUB_API_ERROR: 50
}
Configuration.ERROR_CODES = ERROR_CODES
const ERROR_MESSAGES = {
  MISSING_MERGEABLE_NODE: 'The `mergeable` node is missing.',
  UNKNOWN_VERSION: 'Invalid `version` found.'
}

const WARNING_CODES = {
  CONFIG_NOT_FOUND: 10
}
Configuration.WARNING_CODES = WARNING_CODES

const WARNING_CONFIG_NOT_FOUND = `Configuration file was not found in \`${Configuration.FILE_NAME}\``

module.exports = Configuration
