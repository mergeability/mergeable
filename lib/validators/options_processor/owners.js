const gitPattern = require('./gitPattern')

class Owner {
  static async process (payload, context) {
    const CODEOWNERS = await retrieveCODEOWNER(context)
    if (CODEOWNERS === null) return []

    const owners = gitPattern.parseOwnerFile(CODEOWNERS)

    const compare = await context.github.repos.compareCommits(context.repo({
      base: payload.base.sha,
      head: payload.head.sha
    }))

    const paths = compare.data.files.map(file => file.filename)

    let requiredOwners = []

    paths.forEach(path => {
      const res = owners.for(path)
      if (res.length > 0) {
        requiredOwners = res
      }
    })

    // since requiredOwners could be email addresses make sure
    requiredOwners = await extractUserId(requiredOwners)

    return requiredOwners
  }
}

const extractUserId = async (owners) => {
  return owners.map(owner => {
    if (owner.charAt(0) === '@') {
      return owner.slice(1)
    } else if (EMAIL_REGEX.test(owner)) {
      return owner
    } else {
      return owner
    }
  })
}

const retrieveCODEOWNER = async (context) => {
  return context.github.repos.getContents(context.repo({
    path: OWNER_FILE_PATH
  })).then(res => {
    return Buffer.from(res.data.content, 'base64').toString()
  }).catch(error => {
    if (error.status === 404) return null
    else throw error
  })
}

const OWNER_FILE_PATH = `.github/CODEOWNERS`
const EMAIL_REGEX = new RegExp(`(?:[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])`, 'i')

module.exports = Owner
