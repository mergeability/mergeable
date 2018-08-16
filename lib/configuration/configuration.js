const yaml = require('js-yaml')

class Configuration {
  constructor (settings) {
    if (settings === undefined) {
      this.settings = {}
    } else {
      this.settings = yaml.safeLoad(settings)
      const version = this.checkConfigVersion()

      if (!this.isFlexVersion()) {
        this.validate()
      }

      if (version > 0) {
        this.settings = require(`./transformers/v${version}Config`).transform(this.settings)
      }

    }

    if (!this.isFlexVersion()) {
      this.loadDefaults()
    }
  }

  checkConfigVersion() {
    if (!process.env.MERGEABLE_VERSION === 'flex') {
      return '0'
    }

    if (!this.settings.version) {
      return '1'
    }
    return (this.settings.version)
  }

  isFlexVersion() {
    return (process.env.MERGEABLE_VERSION === 'flex')
  }

  validate() {
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
Configuration.DEFAULTS = {
  label: 'work in progress|do not merge|experimental|proof of concept',
  title: 'wip|dnm|exp|poc',
  stale: {
    message: 'There haven\'t been much activity here. This is stale. Is it still relevant? This is a friendly reminder to please resolve it. :-)'
  }
}

module.exports = Configuration
