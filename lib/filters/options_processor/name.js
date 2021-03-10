const Options = require('./options')

class Name {
  static async process (context, filter, settings) {
    let input = context.payload.repository.name
    let result = await Options.process(context, filter, input, settings.name)
    return { input: {name: input}, result }
  }
}

module.exports = Name
