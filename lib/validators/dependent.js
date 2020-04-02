const { Validator } = require('./validator')
const _ = require('lodash')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructErrorOutput')

class Dependent extends Validator {
  constructor () {
    super('dependent')
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
  }

  async validate (context, validationSettings) {
    let dependentFiles = validationSettings.files

    const FILES_NOT_FOUND_ERROR = `Failed to validate because the 'files' or 'changed' option is missing. Please check the documentation.`
    const DEFUALT_SUCCESS_MESSAGE = 'All the Dependents files are present!'

    // fetch the file list
    let result = await context.github.pulls.listFiles(context.repo({pull_number: this.getPayload(context).number}))
    let modifiedFiles = result.data
      .filter(file => file.status === 'modified' || file.status === 'added')
      .map(file => file.filename)
    const validatorContext = {name: 'Dependent'}

    if (!dependentFiles && !validationSettings.changed) {
      return consolidateResult([constructError('Dependent', modifiedFiles, validationSettings, FILES_NOT_FOUND_ERROR)], validatorContext)
    }

    // when changed option is specified, the validator uses this instead as it's files to validate
    if (validationSettings.changed) {
      dependentFiles = modifiedFiles.includes(validationSettings.changed.file)
        ? [validationSettings.changed.file].concat(validationSettings.changed.files)
        : []
    }

    const fileDiff = _.difference(dependentFiles, modifiedFiles)

    let description = validationSettings.message ||
      `One or more files (${fileDiff.join(', ')}) are missing from your pull request because they are dependent on the following: ${_.difference(dependentFiles, fileDiff)}`

    const isMergeable = dependentFiles.length === fileDiff.length || fileDiff.length === 0
    const output = [constructOutput('Dependent', modifiedFiles, validationSettings, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFUALT_SUCCESS_MESSAGE : description
    })]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Dependent
