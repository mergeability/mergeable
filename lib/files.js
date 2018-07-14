const { checkIfPathMatches } = require('./gitpatternParser')

/**
 * process the PR based on files settings
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  const fileSettings = settings.files
  if (!fileSettings) {
    return {
      mergeable: true,
      description: 'Okay To Merge'
    }
  }

  const patternToMatch = settings.files.pattern
  // fetch the file list
  const files = await context.github.pullRequests.getFiles(context.repo({number: pr.number}))
  const filesToCheck = files.data
                        .filter(file => file.status === 'added' || file.status === 'modified')
                        .filter(file => checkIfPathMatches(file.filename, patternToMatch))

  // fetch the file content
  const fileContents = await fetchFileContents(filesToCheck, context)

  const failedFiles = fileContents.filter(file => {
    const content = Buffer.from(file.data.content, 'base64').toString()

    return !(content.indexOf(settings.files.header) === 0) // first instead of header must begin at position 0 to be a header
  }).map(file => file.data.path)

  const isMergeable = failedFiles.length === 0

  const message = settings.files.message ||
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
