var cacheManager = require('cache-manager')

class Cache {
  constructor () {
    this.cache = null

    switch (process.env.CACHE_STORAGE) {
      case 'redis':
        var redisStore = require('cache-manager-ioredis')
        this.cache = cacheManager.caching({ store: redisStore, refreshThreshold: 3 })
        break
      default:
        this.cache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10 })
        break
    }
    return this.cache
  }
}

module.exports = Cache
