const _ = require('lodash')
const consts = require('../lib/consts')

class V2Config {
  static transform (config) {
    const transformedConfig = _.cloneDeep(config)
    setPullRequestDefault(transformedConfig)
    return transformedConfig
  }
}

const checkAndSetDefault = (ruleSet, defaultValue) => {
  if (ruleSet === undefined) {
    return defaultValue
  } else {
    return ruleSet.map(rule => {
      if (rule.do === 'checks') {
        const newRule = _.cloneDeep(rule)
        if (_.isUndefined(newRule.status)) newRule.status = defaultValue[0].status
        if (_.isUndefined(newRule.payload)) {
          newRule.payload = defaultValue[0].payload
        } else {
          if (_.isUndefined(newRule.payload.title)) newRule.payload.title = defaultValue[0].payload.title
          if (_.isUndefined(newRule.payload.summary)) newRule.payload.summary = defaultValue[0].payload.summary
        }
        return newRule
      }

      return rule
    })
  }
}

const setPullRequestDefault = (config) => {
  config.mergeable.forEach((recipe) => {
    if (recipe.when.includes('pull_request') ||
        recipe.when.includes('pull_request_review') ||
        recipe.when.includes('issue_comment')) {
      if (!checkIfDefaultShouldBeApplied(recipe)) {
        if (recipe.pass === undefined) {
          recipe.pass = []
        }
        if (recipe.fail === undefined) {
          recipe.fail = []
        }
        if (recipe.error === undefined) {
          recipe.error = []
        }
        return
      }
      recipe.pass = checkAndSetDefault(recipe.pass, consts.DEFAULT_PR_PASS)
      recipe.fail = checkAndSetDefault(recipe.fail, consts.DEFAULT_PR_FAIL)
      recipe.error = checkAndSetDefault(recipe.error, consts.DEFAULT_PR_ERROR)
    } else {
      if (recipe.pass === undefined) {
        recipe.pass = []
      }
      if (recipe.fail === undefined) {
        recipe.fail = []
      }
      if (recipe.error === undefined) {
        recipe.error = []
      }
    }
  })
}

const checkIfDefaultShouldBeApplied = (recipe) => {
  if (recipe.pass === undefined && recipe.fail === undefined && recipe.error === undefined) return true

  // if any of the cases include 'check', then others should have `check' default as well, otherwise, don't do anything
  if (checkIfCheckActionExists(recipe.pass)) return true
  if (checkIfCheckActionExists(recipe.fail)) return true
  if (checkIfCheckActionExists(recipe.error)) return true
}

const checkIfCheckActionExists = (outcome) => {
  if (_.isUndefined(outcome) || outcome === null) return false
  return outcome.find(element => element.do === 'checks')
}

module.exports = V2Config
