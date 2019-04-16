const REGISTRY = [
  new (require('./checkReRun'))(),
  new (require('./milestoned'))()
] // eslint-disable-line

/**
 * Processes all the interceptors in the order of the registry array.
 */
module.exports = async (context) => {
  await Promise.all(REGISTRY.map(interceptor => interceptor.process(context)))
}
