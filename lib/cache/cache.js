var cacheManager = require('cache-manager')

class Cache {
  constructor () {
    this.cache = null

    switch (process.env.CACHE_STORAGE) {
      case 'redis':
        var redisStore = require('cache-manager-ioredis')
        this.cache = cacheManager.caching({ store: redisStore, url: process.env.CACHE_REDIS_URL, refreshThreshold: process.env.CACHE_REDIS_REFRESH_THRESHOLD })
        break
      default:
        this.cache = cacheManager.caching({ store: 'memory', max: process.env.CACHE_MEMORY_MAX, ttl: process.env.CACHE_MEMORY_TTL })
        break
    }
    return this.cache
  }
}

module.exports = Cache
