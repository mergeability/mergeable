const _ = require('lodash')

/**
 * process the PR based on dependent settings
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let dependentSettings = settings.dependent
  if (!dependentSettings) {
    return {
      mergeable: true,
      description: 'Okay To Merge'
    }
  }

  let dependentFiles = settings.dependent.files
  let message = settings.dependent.message ||
    'One of the following file is modified, all the other files in the list must be modified as well ' + dependentFiles.map(name => '\n  -' + name)

  // fetch the file list
  let result = await context.github.pullRequests.getFiles(context.repo({number: pr.number}))
  let modifiedFiles = result.data.filter(file => file.status === 'modified').map(file => file.filename)

  const fileDiff = _.difference(dependentFiles, modifiedFiles)

  const isMergeable = dependentFiles.length === fileDiff.length || fileDiff.length === 0

  return {
    mergeable: isMergeable,
    description: isMergeable ? 'Okay to merge' : message
  }
}
