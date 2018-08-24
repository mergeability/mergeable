const { EventAware } = require('../eventAware')

class Action extends EventAware {
  async beforeValidate () {
    throw new Error('class extending Action must implement beforeValidate function')
  }
  async afterValidate () {
    throw new Error('class extending Action must implement afterValidate function')
  }
}

module.exports = {
  Action
}
