const { Validator } = require('./validator')
const minimatch = require('minimatch')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructOutput = require('./options_processor/options/lib/constructOutput')

const DEFAULT_SUCCESS_MESSAGE = 'Your Contents passes validations'
const VALIDATOR_CONTEXT = { name: 'contents' }

class Contents extends Validator {
  constructor () {
    super('contents')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      files: {
        pr_diff: 'boolean',
        ignore: 'array'
      },
      must_include: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      must_exclude: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      begins_with: {
        match: ['string', 'array'],
        message: 'string'
      },
      ends_with: {
        match: ['string', 'array'],
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    let fileOptions = null
    let patternsToIgnore = ['.github/mergeable.yml']

    let parseOption = validationSettings

    if (validationSettings.files) {
      fileOptions = validationSettings.files
      if (fileOptions.ignore) patternsToIgnore = fileOptions.ignore
      delete parseOption.files
    }

    let result = await context.octokit.paginate(
      context.octokit.pulls.listFiles.endpoint.merge(
        context.repo({ pull_number: this.getPayload(context).number })
      ),
      res => res.data
    )
    let changedFiles = result
      .filter(file => !matchesIgnoredPatterns(file.filename, patternsToIgnore))
      .filter(file => file.status === 'modified' || file.status === 'added')
      .map(file => file.filename)

    let failedFiles = []
    for (let file of changedFiles) {
      const content = await getContent(context, file)

      if (content === null) {
        failedFiles.push(`${file} (Not Found)`)
        continue
      }

      const processed = this.processOptions(parseOption, content)
      if (processed.status === 'error') return processed
      if (processed.status === 'fail') failedFiles.push(file)
    }

    const isMergeable = failedFiles.length === 0
    const output = [constructOutput(VALIDATOR_CONTEXT, changedFiles, validationSettings, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFAULT_SUCCESS_MESSAGE : `Failed files : '${failedFiles.join(',')}'`
    })]

    return consolidateResult(output, VALIDATOR_CONTEXT)
  }
}

const matchesIgnoredPatterns = (filename, patternsToIgnore) => (
  patternsToIgnore.some((ignorePattern) => minimatch(filename, ignorePattern))
)

const getContent = async (context, path) => {
  return context.octokit.repos.getContent(context.repo({
    path: path,
    ref: context.payload.pull_request.head.sha
  })).then(res => {
    return Buffer.from(res.data.content, 'base64').toString()
  }).catch(error => {
    if (error.code === 404) return null
    else throw error
  })
}

module.exports = Contents
