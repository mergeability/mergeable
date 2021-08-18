class Register {
  static registerFilters (rule, registry) {
    if (!rule.filter) {
      return
    }
    rule.filter.forEach(filter => {
      const key = filter.do

      if (!registry.filters.has(key)) {
        const Filter = require(`./filters/${key}`)
        registry.filters.set(key, new Filter())
      }
    })
  }

  static registerValidators (rule, registry) {
    rule.validate.forEach(validation => {
      const key = validation.do

      if (!registry.validators.has(key)) {
        const Validator = require(`./validators/${key}`)
        registry.validators.set(key, new Validator())
      }
    })
  }

  static registerActions (rule, registry) {
    let possibleActions = []
    const outcomesToCheck = [rule.pass, rule.fail, rule.error]

    outcomesToCheck.forEach(actions => {
      if (actions) {
        possibleActions = possibleActions.concat(actions)
      }
    })

    possibleActions.forEach(action => {
      const key = action.do
      if (!registry.actions.has(key)) {
        const Action = require(`./actions/${key}`)
        registry.actions.set(key, new Action())
      }
    })
  }

  static registerAll (settings, registry) {
    settings.forEach(rule => {
      try {
        this.registerFilters(rule, registry)
      } catch (err) {
        throw new Error('Filters have thrown ' + err)
      }
      try {
        this.registerValidators(rule, registry)
      } catch (err) {
        throw new Error('Validators have thrown ' + err)
      }
      try {
        this.registerActions(rule, registry)
      } catch (err) {
        throw new Error('Actions have thrown ' + err)
      }
    })
  }
}

module.exports = Register
