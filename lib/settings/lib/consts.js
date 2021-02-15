module.exports = {
  DEFAULT_USE_CONFIG_FROM_PULL_REQUEST: (process.env.USE_CONFIG_FROM_PULL_REQUEST === 'true') || true,
  DEFAULT_USE_CONFIG_CACHE: (process.env.USE_CONFIG_CACHE === 'true') || false,
  DEFAULT_USE_ORG_AS_DEFAULT_CONFIG: (process.env.USE_ORG_AS_DEFAULT_CONFIG === 'true') || false,
  DEFAULT_CONFIG_PATH: process.env.CONFIG_PATH || ''
}
