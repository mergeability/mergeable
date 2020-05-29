const { Action } = require('./action')

const checkIfMerged = async (context, prNumber) => {
  let status = true

  // return can be 204 or 404 only
  try {
    await context.github.pulls.checkIfMerged(
      context.repo({ pull_number: prNumber })
    )
  } catch (err) {
    if (err.status === 404) {
      status = false
    } else {
      throw err
    }
  }

  return status
}

class Merge extends Action {
  constructor () {
    super('merge')
    this.supportedEvents = [
      'pull_request.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, results) {
    const prNumber = this.getPayload(context).number
    const isMerged = await checkIfMerged(context, prNumber)

    if (!isMerged) {
      let mergeMethod = settings.merge_method ? settings.merge_method : 'merge'
      try {
        await context.github.pulls.merge(context.repo({ pull_number: prNumber, merge_method: mergeMethod }))
      } catch (err) {
        // skip on known errors
        // 405 === Method not allowed , 409 === Conflict
        if (!(err.status === 405 || err.status === 409)) {
          throw err
        }
      }
    }
  }
}

module.exports = Merge
