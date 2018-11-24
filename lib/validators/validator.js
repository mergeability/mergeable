const EventAware = require('../eventAware')
const options = require('./options_processor/options')

const DEFAULT_SUPPORTED_OPTIONS = [
  'and',
  'or',
  'begins_with',
  'ends_with',
  'max',
  'min',
  'must_exclude',
  'must_include',
  'no_empty',
  'required'
]

class Validator extends EventAware {
  constructor () {
    super()
    this.processor = options
  }

  async validate () {
    throw new Error('Class extending validator must implement validate function')
  }

  /**
   * @param eventName
   *  An event name to be evaluated for support. The name is as in the GitHub
   *  webhook format of issues.opened, pull_request.opened, etc
   *
   * @return boolean true if the validator supports the event. i.e. issues.opened
   */

  processOptions (vSettings, value, supportedOptions) {
    return options.process({
      name: vSettings.do,
      supportedOptions: supportedOptions || DEFAULT_SUPPORTED_OPTIONS
    }, value, vSettings)
  }
}

module.exports = {
  Validator: Validator
}
