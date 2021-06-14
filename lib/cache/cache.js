const cacheManager = require('cache-manager')

class Cache {
  constructor () {
    this.cache = null

    switch (process.env.CACHE_STORAGE) {
      case 'redis':
        var redisStore = require('cache-manager-ioredis')
        this.cache = cacheManager.caching({ store: redisStore, host: process.env.CACHE_REDIS_HOST, port: process.env.CACHE_REDIS_PORT, password: process.env.CACHE_REDIS_HOST, db: process.env.CACHE_REDIS_DB, ttl: process.env.CACHE_TTL, refreshThreshold: process.env.CACHE_REDIS_REFRESH_THRESHOLD })
        break
      case 'memory':
        this.cache = cacheManager.caching({ store: 'memory', max: process.env.CACHE_MEMORY_MAX, ttl: process.env.CACHE_TTL })
        break
      default:
        this.cache = cacheManager.caching({ store: 'memory', max: process.env.CACHE_MEMORY_MAX, ttl: process.env.CACHE_TTL })
        break
    }
    return this.cache
  }
}

module.exports = Cache
