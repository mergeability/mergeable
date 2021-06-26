const createPromises = require('./createPromises')

const getFilterPromises = (context, registry, rule) => {
  const filters = []
  if (rule.filter) {
    filters.push(...rule.filter)
  }
  const filterFuncCall = (filter, context, settings) => filter.processFilter(context, settings, registry)

  return createPromises(filters, 'filters', filterFuncCall, context, registry)
}

module.exports = getFilterPromises
