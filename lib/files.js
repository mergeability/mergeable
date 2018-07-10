const { checkIfPathMatches } = require('./gitpatternParser')

/**
 * process the PR based on files settings
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let fileSettings = settings.files
  if (!fileSettings) {
    return {
      mergeable: true,
      description: 'Okay To Merge'
    }
  }

  let patternToMatch = settings.files.pattern
  // fetch the file list
  let result = await context.github.pullRequests.getFiles(context.repo({number: pr.number}))
  let addedFiles = result.data.filter(file => file.status === 'added' || file.status === 'modified')
  // parse the files to match the pattern
  const filesToCheck = addedFiles.filter(file => checkIfPathMatches(file.filename, patternToMatch))

  // fetch the file content
  result = await fetchFileContents(filesToCheck, context)
  const failedFiles = result.filter(file => {
    const content = Buffer.from(file.data.content, 'base64').toString()

    return !(content.indexOf(settings.files.header) === 0) // first instead of header must begin at position 0 to be a header
  }).map(file => file.data.path)

  // check the header of each file

  const isMergeable = failedFiles.length === 0

  let message = settings.files.message ||
    'Following files are missing the required header:' + failedFiles.map(path => '\n  - ' + path)

  return {
    mergeable: isMergeable,
    description: isMergeable ? 'Okay to merge' : message
  }
}

const fetchFileContents = async (files, context) => {
  return Promise.all(files.map(file => {
    const refIndex = file.contents_url.indexOf('ref=')
    const ref = file.contents_url.substring(refIndex + 4)

    return context.github.repos.getContent(context.repo({path: file.filename, ref: ref}))
  }))
}
