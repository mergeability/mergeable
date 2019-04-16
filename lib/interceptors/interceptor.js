/**
 * The Interceptor class defines the interface for all inheriting interceptors that
 * mutates the probot context with additional meta data or changes existing property Values
 * depending on certain criterias.
 *
 * This is used to filter by event and manipulate (add data or modify) the context such that the workflow engine is interacting
 * with the data in context depending on certain scenarios.
 *
 * Interceptors are cached instances and should be treated as singletons and is NOT thread safe. Instance variables should be treated as constants.
 */
class Interceptor {
  /**
   * All Interceptors should overwrite this method and mutate the context as needed.
   * By default returns the context unchanged.
   */
  async process (context) {
    return context
  }
}

module.exports = Interceptor
