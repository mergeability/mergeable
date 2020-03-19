function registerActions (rule, registry) {
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
      let Action = require(`./actions/${key}`)
      registry.actions.set(key, new Action())
    }
  })
}

function registerValidators (rule, registry) {
  rule.validate.forEach(validation => {
    let key = validation.do

    if (!registry.validators.has(key)) {
      let Validator = require(`./validators/${key}`)
      registry.validators.set(key, new Validator())
    }
  })
}

function registerValidatorsAndActions (settings, registry) {
  settings.forEach(rule => {
    try {
      registerValidators(rule, registry)
    } catch (err) {
      console.log(err)
      throw new Error('Validators have thrown ' + err)
    }
    try {
      registerActions(registry, rule)
    } catch (err) {
      console.log(err)
      throw new Error('Actions have thrown ' + err)
    }
  })
}

module.exports = {
  registerValidators,
  registerActions,
  registerValidatorsAndActions
}
