const matchOneDirRegex = new RegExp(`\\/[*]$`, 'i')
const matchAllRegex = new RegExp('^[*]$', 'i')
const matchFileTypeRegex = new RegExp('^[*][\\.]\\w*$', 'i')
const matchAnyMiddleDirRegex = new RegExp('\\/[*]{2}\\/', 'i') // check if two stars exists in the middle
const matchtwoStarAtTheEndRegex = new RegExp('\\/[*]{2}$', 'i')
const matchtwoStarAtTheStartRegex = new RegExp('^[*]{2}\\/', 'i')

class GitPattern {
  static parseOwnerFile (content) {
    const owners = parseGitPatten(content)

    return {
      for: (path) => {
        let res = []
        owners.filter(([globs]) => {
          return !globs || globs.split(' ').find(glob => this.checkIfPathMatches(path, glob))
        }).forEach(owners => {
          res = owners.slice(1)
        })
        return res
      }
    }
  }

  static checkIfPathMatches (path, toMatch) {
    if (matchAllRegex.test(toMatch)) {
      return true
    }
    if (matchFileTypeRegex.exec(toMatch)) {
      const file = getFileName(path)
      const regex = new RegExp(toMatch.slice(1), 'i')
      return regex.test(file)
    }
    // all the simple cases are matched, now to the complex regex string
    const regex = createRegexToMatch(toMatch)
    if (path.charAt(0) === '/') {
      path = path.slice(1)
    }

    return regex.test(path)
  }
}

const createRegexToMatch = (toMatch) => {
  let regexString = ''
  const onlyRootMatch = toMatch.charAt(0) === '/'
  if (onlyRootMatch) {
    toMatch = toMatch.substring(1)
    regexString += `^`
  }

  const matchOneDir = matchOneDirRegex.test(toMatch)
  if (matchOneDir) {
    toMatch = toMatch.substring(0, toMatch.length - 1)
  }

  const matchAnyMiddleDir = matchAnyMiddleDirRegex.test(toMatch)
  if (matchAnyMiddleDir) {
    toMatch = toMatch.replace('/**/', `\\/(\\w*\\/)*`)
  }

  const matchtwoStarAtTheEnd = matchtwoStarAtTheEndRegex.test(toMatch)

  if (matchtwoStarAtTheEnd) {
    toMatch = toMatch.replace('/**', `\\/`)
  }

  const matchtwoStarAtTheStart = matchtwoStarAtTheStartRegex.test(toMatch)

  if (matchtwoStarAtTheStart) {
    toMatch = toMatch.replace('**/', ``)
  }

  regexString += toMatch

  if (matchOneDir) {
    regexString += `\\w*[.]?\\w*$`
  }
  return new RegExp(regexString, 'i')
}

const getFileName = (path) => {
  const regex = new RegExp(`\\/\\w+[.](\\w*)$`, 'i')
  const fileName = regex.exec(path)
  if (fileName) {
    return fileName[0].substring(1)
  }
  return fileName
}

const parseGitPatten = (content) => {
  let lines = content.split(/\r\n|\n/)
  return parse(lines)
}

const parse = (arr) => {
  arr = arrayify(arr)
  let output = []

  arr.forEach(str => {
    str = (str || '').trim()

    // skip comments
    if (str && str.charAt(0) !== '#') {
      const parsedArray = []

      str.split(' ').forEach(string => {
        if (string !== '') {
          parsedArray.push(string)
        }
      })

      output.push(parsedArray)
    }
  })
  return output
}

const arrayify = (val) => {
  return Array.isArray(val) ? val : [val]
}

module.exports = GitPattern
