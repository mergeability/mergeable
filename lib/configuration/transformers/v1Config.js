const consts = require('../lib/consts')
const Configuration = require('../configuration')

const simpleConfigMapping = {
  assignee: (num) => ({
    do: 'assignee',
    min: {
      count: num
    }
  }),
  label: (string) => ({
    do: 'label',
    must_exclude: {
      regex: string
    }
  }),
  title: (string) => ({
    do: 'title',
    must_exclude: {
      regex: string
    }
  }),
  approvals: (num) => ({
    do: 'approvals',
    min: {
      count: num
    }
  }),
  milestone: (string) => ({
    do: 'milestone',
    must_include: {
      regex: string
    }
  }),
  project: (string) => ({
    do: 'project',
    must_include: {
      regex: string
    }
  })
}

class V1Config {
  static transform (config) {
    config = config.mergeable
    const output = []

    if (config.issues) {
      output.push(processValidators('issues.*', config.issues, { pass: [], fail: consts.DEFAULT_ISSUES_FAIL, error: consts.DEFAULT_ISSUES_ERROR }))
      processStale('issues', config.issues, output)
    }

    if (config.pull_requests) {
      output.push(processValidators('pull_request.*', config.pull_requests, { pass: consts.DEFAULT_PR_PASS, fail: consts.DEFAULT_PR_FAIL, error: consts.DEFAULT_PR_ERROR }))
      output.push(processValidators('pull_request_review.*', config.pull_requests, { pass: consts.DEFAULT_PR_PASS, fail: consts.DEFAULT_PR_FAIL, error: consts.DEFAULT_PR_ERROR }))
      processStale('pull_request', config.pull_requests, output)
    }
    if (!config.pull_requests && !config.issues) {
      output.push(processValidators('pull_request.*', config, { pass: consts.DEFAULT_PR_PASS, fail: consts.DEFAULT_PR_FAIL, error: consts.DEFAULT_PR_ERROR }))
      output.push(processValidators('pull_request_review.*', config, { pass: consts.DEFAULT_PR_PASS, fail: consts.DEFAULT_PR_FAIL, error: consts.DEFAULT_PR_ERROR }))
    }
    return { mergeable: output }
  }
}

const processStale = (type, config, output) => {
  const stale = config.stale
  if (stale) {
    output.push({
      when: 'schedule.repository',
      validate: [{
        do: 'stale',
        days: stale.days,
        type: type
      }],
      pass: [{ do: 'comment', payload: { body: stale.message || Configuration.DEFAULTS.stale.message } }]
    })
  }
}

const processValidators = (event, config, options) => {
  // first take care of exclude
  if (config.exclude) {
    const excludeList = config.exclude.split(',')
    excludeList.push('exclude') // also needs to remove exclude

    excludeList.forEach(item => {
      delete config[item.trim()]
    })
  }

  const validate = Object.keys(config).filter(validator => validator !== 'stale').map(validator => {
    const value = config[validator]

    if (typeof value !== 'object') {
      return simpleConfigMapping[validator](value)
    }

    if (validator === 'description' &&
      (typeof value.no_empty === 'boolean' ||
      value['no-empty'] !== undefined)
    ) {
      const enabled = (typeof value.no_empty === 'boolean')
        ? value.no_empty
        : value['no-empty'].enabled || value['no-empty']
      return {
        do: 'description',
        no_empty: { enabled: enabled }
      }
    }

    return Object.assign(value, { do: validator })
  })

  return Object.assign({ when: event, validate }, options)
}

module.exports = V1Config
