const Options = require('./options')
const CacheManager = require('../../cache/cache')
const GithubAPI = require('../../github/api')

// Setup the cache manager
const cacheManager = new CacheManager()

class Topics {
  static async process (context, filter, settings) {
    const input = await repoTopics(context)
    const result = await Options.process(context, filter, input, settings.topics)
    return { input, result }
  }
}

const repoTopics = async (context) => {
  const repo = context.repo()
  const globalSettings = context.globalSettings

  if (globalSettings.use_config_cache !== undefined && globalSettings.use_config_cache === true) {
    const names = await cacheManager.get(`${repo.owner}/${repo.repo}/topics`)
    if (names) {
      return names
    }
  }

  const response = await GithubAPI.getAllTopics(context, {
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name
  })

  if (globalSettings.use_config_cache !== undefined && globalSettings.use_config_cache === true) {
    cacheManager.set(`${repo.owner}/${repo.repo}/topics`, response)
  }
  return response
}

module.exports = Topics
