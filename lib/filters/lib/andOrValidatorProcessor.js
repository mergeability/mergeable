const Register = require('../../register')
const getFilterPromises = require('../../flex/lib/getFilterPromises')
const consolidateResult = require('../options_processor/options/lib/consolidateResults')
const constructError = require('../options_processor/options/lib/constructError')

const OPTION_MISSING_ERROR_MESSAGE = 'Failed to filter because the \'filter\' option is missing or empty. Please check the documentation.'

const andOrValidatorProcessor = async (context, settings, registry, name) => {
  const filterContext = { name: name }

  if (!Array.isArray(settings) || settings.length === 0 || getValueByReservedKey(settings, 'filter')) {
    return consolidateResult(
      [constructError(name, '', settings, OPTION_MISSING_ERROR_MESSAGE)],
      filterContext
    )
  }

  const rules = { filter: settings }

  try {
    Register.registerFilters(rules, registry)
  } catch (err) {
    return consolidateResult(
      [constructError(name, '', settings, 'Unsupported filter ' + err)],
      filterContext
    )
  }

  const promises = getFilterPromises(context, registry, rules)

  const output = await Promise.all(promises)

  const filters = []
  let status = 'fail'

  if (name === 'And') {
    status = 'pass'
  }

  let count = 1
  for (const result of output) {
    if (result.status === 'error') {
      status = 'error'
    }

    if (name === 'Or' && result.status === 'pass' && status !== 'error') {
      status = 'pass'
    }

    if (name === 'And' && result.status === 'fail' && status !== 'error') {
      status = 'fail'
    }

    for (const filter of result.filters) {
      filter.description = `Option ${count}: ${result.name}: ${filter.description}`
    }

    filters.push(...result.filters)
    count++
  }

  return {
    status,
    name: name,
    filters
  }
}

module.exports = andOrValidatorProcessor

function getValueByReservedKey (obj, key) {
  const keys = Object.keys(obj)
  const index = keys.indexOf(key)
  return obj[keys[index]]
}
