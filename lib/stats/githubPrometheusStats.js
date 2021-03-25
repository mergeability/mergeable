const Prometheus = require('prom-client')

module.exports = {
  GithubRateLimitRemainingTotal: new Prometheus.Gauge({
    name: 'github_ratelimit_remaining_total',
    help: 'The total amount of Rate Limit requests remaining',
    labelNames: ['installationId']
  }),
  GithubRateLimitLimitTotal: new Prometheus.Gauge({
    name: 'github_ratelimit_limit_total',
    help: 'The total amount of Rate Limit requests limit',
    labelNames: ['installationId']
  })
}
