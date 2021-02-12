const Options = require('./options')
const CacheManager = require('../../cache/cache')

// Setup the cache manager
var cacheManager = new CacheManager()

class Topics {
  static async process (context, filter, settings) {
    let input = await repoTopics(context)
    let result = await Options.process(context, filter, input, settings.topics)
    return { input, result }
  }
}

const repoTopics = async (context) => {
  if (process.env.USE_CONFIG_CACHE) {
    let names = await cacheManager.get(`${context.payload.full_name}#repoTopics`)
    if (names) {
      return names
    }
  }

  return context.octokit.repos.getAllTopics({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  }).then(response => {
    if (process.env.USE_CONFIG_CACHE) {
      cacheManager.set(`${context.payload.full_name}#repoTopics`, response.data.names)
    }
    return response.data.names
  })
}

module.exports = Topics
