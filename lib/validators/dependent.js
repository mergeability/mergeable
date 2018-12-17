const { Validator } = require('./validator')
const _ = require('lodash')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructErrorOutput')

class Dependent extends Validator {
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
      'pull_request.unlabeled',
      'pull_request.synchronize',
      'issues.opened'
    ]
  }

  async validate (context, validationSettings) {
    let dependentFiles = validationSettings.files

    const FILES_NOT_FOUND_ERROR = `Failed to run the test because 'files' is not provided for 'dependent' option. Please check README for more information about configuration`
    const DEFUALT_SUCCESS_MESSAGE = 'All the Dependents files are represent'
    let description = validationSettings.message ||
      'One of the following file is modified, all the other files in the list must be modified as well:' + dependentFiles.map(name => '\n  - ' + name)

    // fetch the file list
    let result = await context.github.pullRequests.getFiles(context.repo({number: this.getPayload(context).number}))
    let modifiedFiles = result.data.filter(file => file.status === 'modified').map(file => file.filename)

    const validatorContext = {name: 'Dependent'}
    if (!dependentFiles) {
      return consolidateResult([constructError('Dependent', modifiedFiles, validationSettings, FILES_NOT_FOUND_ERROR)], validatorContext)
    }
    const fileDiff = _.difference(dependentFiles, modifiedFiles)

    const isMergeable = dependentFiles.length === fileDiff.length || fileDiff.length === 0

    const output = [constructOutput('Dependent', modifiedFiles, validationSettings, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFUALT_SUCCESS_MESSAGE : description
    })]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Dependent
