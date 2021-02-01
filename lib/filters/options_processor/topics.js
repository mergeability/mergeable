const Options = require('./options')
const NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: 600, maxKeys: 5000 })

class Topics {
  static async process (context, filter, settings) {
    let input = await repoTopics(context)
    let result = await Options.process(context, filter, input, settings.topics)
    return { input, result }
  }
}

const repoTopics = async (context) => {
  if (process.env.USE_CONFIG_CACHE) {
    let names = cache.get(`${context.payload.full_name}#repoTopics`)
    if (names) {
      return names
    }
  }

  return context.octokit.repos.getAllTopics({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  }).then(response => {
    if (process.env.USE_CONFIG_CACHE) {
      cache.set(`${context.payload.full_name}#repoTopics`, response.data.names)
    }
    return response.data.names
  })
}

module.exports = Topics
