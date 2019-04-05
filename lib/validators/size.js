const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')

class Size extends Validator {
  constructor () {
    super()
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.synchronize'
    ]
    this.supportedOptions = ['max']
  }

  async validate (context, validationSettings) {
    const ERROR_MESSAGE = `Failed to validate because the 'lines' or 'max' option is missing. Please check the documentation.`
    const VALIDATOR_NAME = 'Size'
    const validatorContext = {name: VALIDATOR_NAME}

    const payload = this.getPayload(context)
    const filesToIgnore = validationSettings.ignore || []
    const getFilesResult = await context.github.pullRequests.getFiles(
      context.repo({number: payload.number})
    )

    // Possible file statuses: addded, modified, removed.
    const modifiedFiles = getFilesResult.data
      .filter(file => !filesToIgnore.includes(file.filename))
      .filter(file => file.status === 'modified' || file.status === 'added')
      .map(
        file => ({
          filename: file.filename,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes
        })
      )

    let additions = 0
    let deletions = 0
    let totalChanges = 0

    modifiedFiles.forEach((file) => {
      additions += file.additions
      deletions += file.deletions
      totalChanges += file.changes
    })

    const inputMessage = `${totalChanges} (${additions} additions, ${deletions} deletions)`

    if (!validationSettings.lines || !validationSettings.lines.max) {
      return consolidateResult(
        [
          constructErrorOutput(
            VALIDATOR_NAME,
            inputMessage,
            validationSettings,
            ERROR_MESSAGE
          )
        ],
        validatorContext
      )
    }

    const isMergeable = totalChanges <= validationSettings.lines.max.count
    const defaultFailMessage = `PR is too large. Should be under ${validationSettings.lines.max.count} total additions + deletions`
    const result = {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable
        ? 'PR size is OK!'
        : validationSettings.lines.max.message || defaultFailMessage
    }
    const output = constructOutput(
      validatorContext,
      inputMessage,
      validationSettings,
      result
    )

    return consolidateResult([output], validatorContext)
  }
}

module.exports = Size
