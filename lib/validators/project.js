const { Validator } = require('./validator')
const deepValidation = require('./options_processor/deepValidation')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructErrorOutput')

class Project extends Validator {
  constructor () {
    super('project')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*',
      'issues.*'
    ]
    this.supportedSettings = {
      must_include: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      }
    }
  }

  async validate (context, validationSettings) {
    const pr = this.getPayload(context)
    let projectName = validationSettings.must_include &&
      validationSettings.must_include.regex

    const MATCH_NOT_FOUND_ERROR = `Failed to run the test because 'match' is not provided for 'project' option. Please check README for more information about configuration`
    const DEFUALT_SUCCESS_MESSAGE = 'Required Project is present'
    let description = validationSettings.message ||
      `Must be in the "${projectName}" project.`

    let projects = await this.githubAPI.projectListForRepo(context, context.repo())
    const validatorContext = {name: 'project'}
    if (!projectName) {
      return consolidateResult([constructError('project', projects, validationSettings, MATCH_NOT_FOUND_ERROR)], validatorContext)
    }

    const regex = new RegExp(projectName, 'i')

    let projIds = projects.filter(project => regex.test(project.name)).map(project => project.id)
    let projectCards = await getProjectCards(context, projIds, this)
    const idsFromCards = extractIssueIdsFromCards(pr, projectCards)
    let isMergeable = idsFromCards.includes(String(pr.number))

    if (!isMergeable) { // do deep validation
      const issuesPrCloses = deepValidation.checkIfClosesAnIssue(pr.body)

      isMergeable = issuesPrCloses.some(issue => idsFromCards.includes(issue))
    }
    return consolidateResult([constructOutput(validatorContext, projects.map(proj => proj.name), validationSettings, {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? DEFUALT_SUCCESS_MESSAGE : description
    })], validatorContext)
  }
}

const extractIssueIdsFromCards = (pr, cards) => {
  let ids = []
  let issueUrl = pr.head.repo.issues_url
  issueUrl = issueUrl.substring(0, issueUrl.length - ('{/number}').length)

  for (let card of cards) {
    const match = card.indexOf(issueUrl)

    if (match !== -1) {
      ids.push(card.substring(match + issueUrl.length + 1))
    }
  }

  return ids
}

const getProjectCards = async (context, projIds, validatorObj) => {
  let cards = []

  // get all the project columns
  for (let i = 0; i < projIds.length; i++) {
    const columnIds = await validatorObj.githubAPI.projectListColumns(context, {project_id: projIds[i]})

    let res = await Promise.all(columnIds.map(id => validatorObj.githubAPI.projectListCards(context, {column_id: id})))
    res.forEach(card => {
      cards = cards.concat(card.data)
    })
  }

  return cards.map(card => card.content_url)
}

module.exports = Project
