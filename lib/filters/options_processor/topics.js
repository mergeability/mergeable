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
  let repo = context.repo()
  const globalSettings = context.globalSettings

  if (globalSettings.use_config_cache !== undefined && globalSettings.use_config_cache === true) {
    let names = await cacheManager.get(`${repo.owner}/${repo.repo}/topics`)
    if (names) {
      return names
    }
  }

  return context.octokit.repos.getAllTopics({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  }).then(response => {
    if (globalSettings.use_config_cache !== undefined && globalSettings.use_config_cache === true) {
      cacheManager.set(`${repo.owner}/${repo.repo}/topics`, response.data.names)
    }
    return response.data.names
  })
}

module.exports = Topics
