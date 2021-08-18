/**
 * This code is a fork from the 'probot-scheduler' (https://github.com/probot/scheduler)
 * Reasons for this modified code:
 * - The above repo is no longer maintained
 * - This code is modified to be compatible with probot@11.0.1
 */

const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 0 })
const ignoredAccounts = (process.env.IGNORED_ACCOUNTS || '')
  .toLowerCase()
  .split(',')

const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
}

module.exports = (app, options) => {
  options = Object.assign({}, defaults, options || {})
  const intervals = {}

  // https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
  app.on('installation.created', async event => {
    const installation = event.payload.installation

    await eachRepository(installation, async repository => {
      await schedule(installation, repository)
    })
  })

  // https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
  app.on('installation_repositories.added', async event => {
    return setupInstallation(event.payload.installation)
  })

  setup()

  function setup () {
    return eachInstallation(setupInstallation)
  }

  function setupInstallation (installation) {
    if (ignoredAccounts.includes(installation.account.login.toLowerCase())) {
      app.log.info({ installation }, 'Installation is ignored')
      return
    }

    limiter.schedule(eachRepository, installation, repository => {
      schedule(installation, repository)
    })
  }

  function schedule (installation, repository) {
    if (intervals[repository.id]) {
      return
    }

    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0

    app.log.debug({ repository, delay, interval: options.interval }, 'Scheduling interval')

    intervals[repository.id] = setTimeout(() => {
      const event = {
        name: 'schedule',
        payload: { action: 'repository', installation, repository }
      }

      // Trigger events on this repository on an interval
      intervals[repository.id] = setInterval(
        () => app.receive(event),
        options.interval
      )

      // Trigger the first event now
      app.receive(event)
    }, delay)
  }

  async function eachInstallation (callback) {
    app.log.trace('Fetching installations')
    const github = await app.auth()

    const installations = await github.paginate(
      github.apps.listInstallations.endpoint.merge({ per_page: 100 })
    )

    const filteredInstallations = options.filter
      ? installations.filter(inst => options.filter(inst))
      : installations
    return filteredInstallations.forEach(callback)
  }

  async function eachRepository (installation, callback) {
    app.log.trace({ installation }, 'Fetching repositories for installation')
    const github = await app.auth(installation.id)

    const repositories = await github.paginate(
      github.apps.listReposAccessibleToInstallation.endpoint.merge({ per_page: 100 }),
      response => {
        return response.data
      }
    )

    const filteredRepositories = options.filter
      ? repositories.filter(repo => options.filter(installation, repo))
      : repositories

    return filteredRepositories.forEach(async repository =>
      callback(repository, github)
    )
  }

  function stop (repository) {
    app.log.info({ repository }, 'Canceling interval')

    clearInterval(intervals[repository.id])
  }

  return { stop }
}
