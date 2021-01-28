module.exports = (filter, input, rule, result, error) => {
  return {
    filter: filter,
    status: result.status,
    description: result.description,
    details: {
      input: input,
      settings: rule,
      error: error
    }
  }
}
