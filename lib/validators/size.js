const minimatch = require('minimatch')

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
    const patternsToIgnore = validationSettings.ignore || []
    const listFilesResult = await context.github.pullRequests.listFiles(
      context.repo({pull_number: payload.number})
    )

    // Possible file statuses: addded, modified, removed.
    const modifiedFiles = listFilesResult.data
      .filter(file => !matchesIgnoredPatterns(file.filename, patternsToIgnore))
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

    if (!validationSettings.lines) {
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

    let isMergeable = true
    let messages = []
    let description, defaultFailMessage

    if (!!validationSettings.lines.additions && !!validationSettings.lines.additions.count) {
      isMergeable = additions <= validationSettings.lines.additions.count
      defaultFailMessage = `PR is too large. Should be under ${validationSettings.lines.additions.count} additions`
      description = isMergeable
      ? 'PR size for additions is OK!'
      : validationSettings.lines.additions.message || defaultFailMessage
      messages.push(description)
    }

    if (!!validationSettings.lines.deletions && !!validationSettings.lines.deletions.count) {
      isMergeable = deletions <= validationSettings.lines.deletions.count
      defaultFailMessage = `PR is too large. Should be under ${validationSettings.lines.deletions.count} deletions`
      description = isMergeable
        ? 'PR size for deletions is OK!'
        : validationSettings.lines.deletions.message || defaultFailMessage
      messages.push(description)
    }

    if (!!validationSettings.lines.total && !!validationSettings.lines.total.count) {
      isMergeable = totalChanges <= validationSettings.lines.total.count
      defaultFailMessage = `PR is too large. Should be under ${validationSettings.lines.total.count} total additions + deletions`
      description = isMergeable
        ? 'PR size for total additions + deletions is OK!'
        : validationSettings.lines.total.message || defaultFailMessage
      messages.push(description)
    }

    const output = messages.map(message => {
      const result = {
        status: isMergeable ? 'pass' : 'fail',
        description: message
      }

      return constructOutput(
        validatorContext,
        inputMessage,
        validationSettings,
        result
      )
    })

    return consolidateResult(output, validatorContext)
  }
}

const matchesIgnoredPatterns = (filename, patternsToIgnore) => (
  patternsToIgnore.some((ignorePattern) => minimatch(filename, ignorePattern))
)

module.exports = Size
