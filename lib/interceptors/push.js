const Interceptor = require('./interceptor')
const processWorkflow = require('../flex/lib/processWorkflow')
const Configuration = require('../configuration/configuration')
const logAndProcessConfigErrors = require('../flex/lib/logAndProcessConfigErrors')
const _ = require('lodash')

/**
 * Checks the event for a push event. This GH event is triggered when the user push commits to any branch
 *
 * Re-run checks on all PR against the branch in which the commits have been pushed iff the config file has been changed
 */
class Push extends Interceptor {
  async process (context) {
    if (context.event !== 'push') return context

    // if there is no head_commit, just skip
    if (_.isUndefined(context.payload.head_commit)) return context

    const addedFiles = context.payload.head_commit.added
    const modifiedFiles = context.payload.head_commit.modified

    const configPath = process.env.CONFIG_PATH ? process.env.CONFIG_PATH : 'mergeable.yml'
    if (!(addedFiles.includes(`.github/${configPath}`) || modifiedFiles.includes(`.github/${configPath}`))) return context
    const config = await Configuration.instanceWithContext(context)
    if (config.hasErrors()) {
      await logAndProcessConfigErrors(context, config)
      return context
    }

    const registry = { validators: new Map(), actions: new Map() }

    const res = await context.github.pulls.list(context.repo({
      base: context.payload.ref
    }))

    const pulls = res.data

    await Promise.all(pulls.map(pullRequest => {
      const newContext = _.cloneDeep(context)
      newContext.event = 'pull_request'
      newContext.payload.pull_request = pullRequest
      newContext.payload.action = 'push_synchronize'
      return processWorkflow(newContext, registry, config)
    }))

    return context
  }
}

module.exports = Push
