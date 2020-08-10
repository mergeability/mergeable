class UnSupportedSettingError extends Error {
  constructor (message) {
    super(message)
    this.name = 'UnSupportedSettingError'
  }
}

module.exports = UnSupportedSettingError
