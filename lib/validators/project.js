const { Validator } = require('./validator')
const deepValidation = require('./options_processor/deepValidation')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')
const constructError = require('./options_processor/options/lib/constructErrorOutput')

class Project extends Validator {
  constructor () {
    super('project')
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
      'pull_request.synchronize',
      'issues.*'
    ]
  }

  async validate (context, validationSettings) {
    const pr = this.getPayload(context)
    let projectName = validationSettings.must_include &&
      validationSettings.must_include.regex

    const MATCH_NOT_FOUND_ERROR = `Failed to run the test because 'match' is not provided for 'project' option. Please check README for more information about configuration`
    const DEFUALT_SUCCESS_MESSAGE = 'Required Project is present'
    let description = validationSettings.message ||
      `Must be in the "${projectName}" project.`

    let projects = await getProjects(context)
    const validatorContext = {name: 'project'}
    if (!projectName) {
      return consolidateResult([constructError('project', projects, validationSettings, MATCH_NOT_FOUND_ERROR)], validatorContext)
    }

    const regex = new RegExp(projectName, 'i')

    let projIds = projects.filter(project => regex.test(project.name)).map(project => project.id)
    let projectCards = await getProjectCards(context, projIds)
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

const getProjects = async (context) => {
  const res = await context.github.projects.listForRepo(
    context.repo()
  )

  return res.data.map(project => ({id: project.id, name: project.name}))
}

const getProjectCards = async (context, projIds) => {
  let cards = []

  // get all the project columns
  for (let i = 0; i < projIds.length; i++) {
    let res = await context.github.projects.listColumns({project_id: projIds[i]})
    const columnIds = res.data.map(project => project.id)

    res = await Promise.all(columnIds.map(id => context.github.projects.listCards({column_id: id})))
    res.forEach(card => {
      cards = cards.concat(card.data)
    })
  }

  return cards.map(card => card.content_url)
}

module.exports = Project
