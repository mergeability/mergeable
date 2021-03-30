const { Validator } = require('./validator')
const _ = require('lodash')
const minimatch = require('minimatch')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructErrorOutput')

class Dependent extends Validator {
  constructor () {
    super('dependent')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      files: 'array',
      message: 'string',
      changed: {
        file: 'string',
        required: 'array',
        files: 'array'
      }
    }
  }

  async validate (context, validationSettings) {
    let dependentFiles = validationSettings.files

    const FILE_NOT_FOUND_ERROR = `Failed to validate because the 'file' sub option for 'changed' option is missing. Please check the documentation`
    const FILES_NOT_FOUND_ERROR = `Failed to validate because the 'files' or 'changed' option is missing. Please check the documentation.`
    const DEFUALT_SUCCESS_MESSAGE = 'All the Dependents files are present!'

    // fetch the file list
    let result = await this.githubAPI.listFiles(context, context.repo({ pull_number: this.getPayload(context).number }))

    let modifiedFiles = result
      .filter(file => file.status === 'modified' || file.status === 'added')
      .map(file => file.filename)
    const validatorContext = {name: 'Dependent'}

    if (!dependentFiles && !validationSettings.changed) {
      return consolidateResult([constructError('Dependent', modifiedFiles, validationSettings, FILES_NOT_FOUND_ERROR)], validatorContext)
    }

    let isMergeable
    let fileDiff
    // when changed option is specified, the validator uses this instead as it's files to validate
    if (validationSettings.changed) {
      if (_.isUndefined(validationSettings.changed.file)) {
        return consolidateResult([constructError('Dependent', modifiedFiles, validationSettings, FILE_NOT_FOUND_ERROR)], validatorContext)
      }
      dependentFiles = modifiedFiles.some((filename) => minimatch(filename, validationSettings.changed.file))
        ? validationSettings.changed.required ? validationSettings.changed.required : validationSettings.changed.files
        : []

      fileDiff = _.difference(dependentFiles, modifiedFiles)
      isMergeable = fileDiff.length === 0
    } else {
      fileDiff = _.difference(dependentFiles, modifiedFiles)
      isMergeable = fileDiff.length === dependentFiles.length || fileDiff.length === 0
    }

    let description = validationSettings.message ||
      `One or more files (${fileDiff.join(', ')}) are missing from your pull request because they are dependent on the following: ${_.difference(dependentFiles, fileDiff)}`

    const output = [constructOutput('Dependent', modifiedFiles, validationSettings, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFUALT_SUCCESS_MESSAGE : description
    })]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Dependent
