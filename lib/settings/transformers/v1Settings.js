const _ = require('lodash')
const consts = require('../lib/consts')

class V1Settings {
  static transform (Settings) {
    let transformedSettings = _.cloneDeep(Settings)
    setSettingsDefault(transformedSettings)
    return transformedSettings
  }
}

const checkAndSetDefault = (ruleSet, defaultValue) => {
  if (ruleSet === undefined) {
    return defaultValue
  }
  return ruleSet
}

const setSettingsDefault = (Settings) => {
  let mergeableSettings = Settings.mergeable

  mergeableSettings.use_config_from_pull_request = checkAndSetDefault(mergeableSettings.use_config_from_pull_request, consts.DEFAULT_USE_CONFIG_FROM_PULL_REQUEST)
  mergeableSettings.use_config_cache = checkAndSetDefault(mergeableSettings.use_config_cache, consts.DEFAULT_USE_CONFIG_CACHE)
  mergeableSettings.use_org_as_default_config = checkAndSetDefault(mergeableSettings.use_org_as_default_config, consts.DEFAULT_USE_ORG_AS_DEFAULT_CONFIG)
  mergeableSettings.config_path = checkAndSetDefault(mergeableSettings.config_path, consts.DEFAULT_CONFIG_PATH)
}

module.exports = V1Settings
