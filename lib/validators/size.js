const minimatch = require('minimatch')
const { pick, mapKeys, isUndefined } = require('lodash')
const fetch = require('node-fetch')

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
    this.supportedSettings = {
      ignore: 'array',
      lines: {
        max: {
          count: 'number',
          message: 'string'
        },
        total: {
          count: 'number',
          message: 'string'
        },
        additions: {
          count: 'number',
          message: 'string'
        },
        deletions: {
          count: 'number',
          message: 'string'
        },
        ignore_comments: 'boolean'
      }
    }
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

    await calculateChangesWithoutComments(this.getPayload(context).diff_url)

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

const calculateChangesWithoutComments = async (url) => {
  const response = await fetch(url)
  const diffs = await response.text()

  const files = diffs.split('diff --git')
  files.shift()

  const processedFiles = []

  for (let file of files) {
    const lines = file.split('\n')

    if (file.includes('deleted')) continue

    let fileStatus = 'modified'
    if (file.includes('--- /dev/null')) {
      fileStatus = 'added'
    }
    const addOrDeleteRegex = new RegExp(/^(\+|-)/i)
    const fileModifierRegex = new RegExp(/(\+\+\+|---)/i)

    let additions = 0
    let deletions = 0
    for (let line of lines) {
      if (addOrDeleteRegex.test(line) && !fileModifierRegex.test(line)) {
        const lineContent = line.substring(1).trim()

        const plusOrMinus = line[0]
        if (plusOrMinus === '+') additions++
        else deletions++

        console.log(lineContent)
      }
    }

    processedFiles.push({
      status: fileStatus,
      name: extractFileName(file),
      additions,
      deletions,
      changes: additions + deletions
    })
  }

  console.log(processedFiles)
}

const extractFileName = (file) => {
  const startIndex = file.indexOf('+++ b/')
  const endIndex = file.indexOf('\n', startIndex)

  return file.substring(startIndex + 6, endIndex)
}

const matchesIgnoredPatterns = (filename, patternsToIgnore) => (
  patternsToIgnore.some((ignorePattern) => minimatch(filename, ignorePattern))
)

module.exports = Size
