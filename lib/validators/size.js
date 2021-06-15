const minimatch = require('minimatch')
const { pick, mapKeys, isUndefined } = require('lodash')
const fetch = require('node-fetch')

const { Validator } = require('./validator')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructErrorOutput = require('./options_processor/options/lib/constructErrorOutput')

const SINGLE_LINE_COMMENT_REGEXES = {
  '.js': /^\/\//i,
  '.py': /^#/i
}

const BLOCK_COMMENT_REGEXES = {
  '.js': {
    beginning: /\/\*/i,
    end: /\*\//i
  },
  '.py': null
}

class Size extends Validator {
  constructor () {
    super('size')
    this.supportedFileExtensionForCommentIgnore = [
      '.js',
      '.py'
    ]
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      match: 'array',
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
    const ERROR_MESSAGE = 'Failed to validate because the \'lines\' or \'max / total\', \'additions\' or \'deletions\' option is missing. Please check the documentation.'
    const ERROR_MAX_TOTAL = 'Options max and total cannot be used together. Please choose one'
    const VALIDATOR_NAME = 'Size'
    const validatorContext = { name: VALIDATOR_NAME }

    const patternsToInclude = validationSettings.match || ['**']
    const patternsToIgnore = validationSettings.ignore || []
    const listFilesResult = await this.githubAPI.listFiles(context, context.repo({ pull_number: this.getPayload(context).number }))

    let modifiedFiles
    if (validationSettings.lines && validationSettings.lines.ignore_comments) {
      modifiedFiles = await this.calculateChangesWithoutComments(this.getPayload(context).diff_url)
    } else {
      // Possible file statuses: added, modified, removed.
      modifiedFiles = listFilesResult
        .filter(file => matchesPatterns(file.filename, patternsToInclude))
        .filter(file => !matchesPatterns(file.filename, patternsToIgnore))
        .filter(file => file.status === 'modified' || file.status === 'added')
        .map(
          file => ({
            filename: file.filename,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes
          })
        )
    }

    const prSizeChanges = {
      additions: 0,
      deletions: 0,
      total: 0
    }

    modifiedFiles.forEach((file) => {
      prSizeChanges.additions += file.additions
      prSizeChanges.deletions += file.deletions
      prSizeChanges.total += file.changes
    })

    const inputMessage = `${prSizeChanges.total} total, ${prSizeChanges.additions} additions, ${prSizeChanges.deletions} deletions
    Files: ${modifiedFiles.map(file => file.filename).join(',')}`

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
    const output = []

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

  async calculateChangesWithoutComments (url) {
    const response = await fetch(url)
    const diffs = await response.text()
    const files = diffs.split('diff --git')
    files.shift()

    const processedFiles = []

    for (const file of files) {
      const filename = extractFileName(file)
      const fileExtension = extractFileExtension(filename)

      const lines = file.split('\n')

      if (file.includes('deleted')) continue

      // eslint-disable-next-line prefer-regex-literals
      const addOrDeleteRegex = new RegExp(/^(\+|-)/i)
      // eslint-disable-next-line prefer-regex-literals
      const fileModifierRegex = new RegExp(/(\+\+\+|---)/i)
      const singleLineCommentRegex = new RegExp(SINGLE_LINE_COMMENT_REGEXES[fileExtension])

      let additions = 0
      let deletions = 0
      let isBlockCommentActive = false
      for (const line of lines) {
        if (addOrDeleteRegex.test(line) && !fileModifierRegex.test(line)) {
          if (this.supportedFileExtensionForCommentIgnore.includes(fileExtension)) {
            const lineContent = line.substring(1).trim()
            if (singleLineCommentRegex.test(lineContent)) continue

            if (BLOCK_COMMENT_REGEXES[fileExtension] !== null) {
              const blockCommentStartRegex = new RegExp(BLOCK_COMMENT_REGEXES[fileExtension].beginning)
              const blockCommentEndRegex = new RegExp(BLOCK_COMMENT_REGEXES[fileExtension].end)

              if (isBlockCommentActive) {
                if (blockCommentEndRegex.test(lineContent)) isBlockCommentActive = false
                continue
              } else if (blockCommentStartRegex.test(lineContent)) {
                if (!blockCommentEndRegex.test(lineContent)) {
                  isBlockCommentActive = true
                }
                continue
              }
            }
          }

          const plusOrMinus = line[0]
          if (plusOrMinus === '+') additions++
          else deletions++
        }
      }

      processedFiles.push({
        filename: filename,
        additions,
        deletions,
        changes: additions + deletions
      })
    }

    return processedFiles
  }
}

const extractFileExtension = (filename) => {
  // eslint-disable-next-line prefer-regex-literals
  const fileExtensionRegex = new RegExp(/\.[0-9a-z]+$/i)

  const matches = filename.match(fileExtensionRegex)
  return matches ? matches[0] : matches
}

const extractFileName = (file) => {
  const startIndex = file.indexOf('+++ b/')
  const endIndex = file.indexOf('\n', startIndex)

  return file.substring(startIndex + 6, endIndex)
}

const matchesPatterns = (filename, patterns) => (
  patterns.some((pattern) => minimatch(filename, pattern, { dot: true }))
)

module.exports = Size
