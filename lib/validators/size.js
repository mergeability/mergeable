const minimatch = require('minimatch')
const { pick, mapKeys, isUndefined } = require('lodash')

const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')

class Size extends Validator {
  constructor () {
    super('size')
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
    const ERROR_MESSAGE = `Failed to validate because the 'lines' or 'max / total', 'additions' or 'deletions' option is missing. Please check the documentation.`
    const ERROR_MAX_TOTAL = 'Options max and total cannot be used together. Please choose one'
    const VALIDATOR_NAME = 'Size'
    const validatorContext = {name: VALIDATOR_NAME}

    const payload = this.getPayload(context)
    const patternsToIgnore = validationSettings.ignore || []
    const listFilesResult = await context.github.pulls.listFiles(
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

    let prSizeChanges = {
      additions: 0,
      deletions: 0,
      total: 0
    }

    modifiedFiles.forEach((file) => {
      prSizeChanges.additions += file.additions
      prSizeChanges.deletions += file.deletions
      prSizeChanges.total += file.changes
    })

    const inputMessage = `${prSizeChanges.total} total, ${prSizeChanges.additions} additions, ${prSizeChanges.deletions} deletions`

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

    // lets get available keys. must be either total, max, additions or deletions
    const prSize = pick(validationSettings.lines, ['additions', 'deletions', 'total', 'max'])

    if (!isUndefined(prSize.max) && !isUndefined(prSize.total)) {
      return consolidateResult(
        [
          constructErrorOutput(
            VALIDATOR_NAME,
            inputMessage,
            validationSettings,
            ERROR_MAX_TOTAL
          )
        ],
        validatorContext
      )
    }

    if (prSize.max) {
      prSize.total = prSize.max
      delete prSize.max
    }
    let output = []

    mapKeys(prSize, (value, key) => {
      const isMergeable = prSizeChanges[key] <= value.count
      const message = key === 'total' ? 'total additions + deletions' : key
      const defaultFailMessage = `PR is too large. Should be under ${value.count} ${message}`
      const description = isMergeable
        ? `PR size for ${message} is OK!`
        : value.message || defaultFailMessage
      const result = {
        status: isMergeable ? 'pass' : 'fail',
        description: description
      }

      output.push(constructOutput(
        validatorContext,
        inputMessage,
        validationSettings,
        result
      ))
    })

    if (output.length === 0) {
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

    return consolidateResult(output, validatorContext)
  }
}

const matchesIgnoredPatterns = (filename, patternsToIgnore) => (
  patternsToIgnore.some((ignorePattern) => minimatch(filename, ignorePattern))
)

module.exports = Size
