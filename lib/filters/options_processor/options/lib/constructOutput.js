module.exports = (filter, rule, result, error) => {
  return {
    filter: filter,
    status: result.status,
    description: result.description,
    details: {
      settings: rule,
      error: error
    }
  }
}
