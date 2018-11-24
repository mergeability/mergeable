const yaml = require('js-yaml')
const consts = require('./lib/consts')

class Configuration {
  constructor (settings) {
    if (settings === undefined) {
      this.settings = {}

      if (this.isFlexVersion()) {
        this.settings = {
          mergeable: [{
            when: 'pull_request.*',
            validate: consts.DEFAULT_VALIDATE,
            pass: consts.DEFAULT_PASS,
            fail: consts.DEFAULT_FAIL,
            error: consts.DEFAULT_ERROR
          }]
        }
      }
    } else {
      this.settings = yaml.safeLoad(settings)
      const version = this.checkConfigVersion()

      if (!this.isFlexVersion()) {
        this.validate()
      }

      if (typeof version !== 'number') {
        throw new Error(Configuration.UNKNOWN_VERSION_ERROR)
      }

      if (version > 0) {
        this.settings = (require(`./transformers/v${version}Config`).transform(this.settings))
        if (!!this.settings.mergeable) { // eslint-disable-line
          this.settings = this.settings.mergeable
        } else {
          throw new Error('mergeable object not found in the configuration')
        }
      }
    }

    if (!this.isFlexVersion()) {
      this.loadDefaults()
    }
  }

  checkConfigVersion () {
    if (!this.isFlexVersion()) {
      return 0
    }

    if (!this.settings.version) {
      return 1
    }
    return (this.settings.version)
  }

  registerValidatorsAndActions (registry, eventName) {
    this.settings.forEach(rule => {
      try {
        rule.validate.forEach(validation => {
          console.log('key', validation.do)
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
        rule.fail.concat(rule.pass).forEach(action => {
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

  isFlexVersion () {
    return (process.env.MERGEABLE_VERSION === 'flex')
  }

  validate () {
    if (this.settings.mergeable === undefined) {
      throw new Error(Configuration.ERROR_INVALID_YML)
    }
  }

  loadDefaults () {
    let pullRequestOrIssuesSubOptionExists = false
    if (this.settings.mergeable == null) this.settings.mergeable = {}
    if (this.settings.mergeable.pull_requests || this.settings.mergeable.issues) pullRequestOrIssuesSubOptionExists = true

    for (let key in Configuration.DEFAULTS) {
      if (!pullRequestOrIssuesSubOptionExists && this.settings.mergeable[key] === undefined) {
        this.settings.mergeable[key] = Configuration.DEFAULTS[key]
      }
    }

    // ensure stale defaults
    if (this.settings.mergeable.pull_requests &&
      this.settings.mergeable.pull_requests.stale &&
      this.settings.mergeable.pull_requests.stale.message === undefined) {
      this.settings.mergeable.pull_requests.stale.message = Configuration.DEFAULTS.stale.message
    }
    if (this.settings.mergeable.issues &&
      this.settings.mergeable.issues.stale &&
      this.settings.mergeable.issues.stale.message === undefined) {
      this.settings.mergeable.issues.stale.message = Configuration.DEFAULTS.stale.message
    }
  }

  static instanceWithContext (context) {
    let github = context.github
    let repo = context.repo()

    return github.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: Configuration.FILE_NAME
    }).then(res => {
      let content = Buffer.from(res.data.content, 'base64').toString()

      return new Configuration(content)
    }).catch(error => {
      if (error.code === 404) return new Configuration()
      else throw error
    })
  }
}

Configuration.FILE_NAME = '.github/mergeable.yml'
Configuration.ERROR_INVALID_YML = 'Invalid mergeable YML file format. Root mergeable node is missing.'
Configuration.UNKNOWN_VERSION_ERROR = 'Invalid version provided! please check README to check all the supported Versions!'
Configuration.DEFAULTS = {
  label: 'work in progress|do not merge|experimental|proof of concept',
  title: 'wip|dnm|exp|poc',
  stale: {
    message: 'There haven\'t been much activity here. This is stale. Is it still relevant? This is a friendly reminder to please resolve it. :-)'
  }
}

module.exports = Configuration
