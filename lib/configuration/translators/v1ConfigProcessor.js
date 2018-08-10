const consts = require('../lib/consts')

const simpleConfigMapping = {
  assignee: (num) => ({do: 'assignee',
    min: {
      count: num
  }}),
  label: (string) => ({do: 'label',
    must_exclude: {
      regex: string
  }}),
  title: (string) => ({do: 'title',
    must_exclude: {
      regex: string
  }}),
  approvals: (num) => ({do: 'approvals',
    min: {
      count: num
  }}),
  milestone: (string) => ({do: 'milestone',
    must_include: {
      regex: string
  }}),
  project: (string) => ({do: 'project',
    must_include: {
      regex: string
    }
  })
}

const configProcessor = (config) => {
  config = config.mergeable
  const output = []
  console.log(config)

  if (config.issues) {
    output.push(processValidators('issues.*', config.issues))
  }

  if (config.pull_requests) {
    output.push(processValidators('pull_request.*', config.pull_requests))
  } else {
    output.push(processValidators('pull_request.*', config))
  }

  return {mergeable: output}
}

const processValidators = (event, config) => {
  // first take care of exclude
  if (config.exclude) {
    const excludeList = config.exclude.split(',')
    excludeList.push('exclude') // also needs to remove exclude

    excludeList.forEach(item => {
      delete config[item.trim()]
    })
  }

  const validate = Object.keys(config).map(validator => {
    const value = config[validator]

    if (typeof value !== 'object') {
      return simpleConfigMapping[validator](value)
    }

    return Object.assign(value, {'do': validator})
  })

  return { when: event, validate, pass: consts.DEFAULT_PASS, failure: consts.DEFAULT_FAIL }

}

module.exports = configProcessor
