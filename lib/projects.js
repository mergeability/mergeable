const issues = require('../lib/issues')

/**
 * Determines if the the PR is mergeable if in a Project specifed in settings
 *
 * @return
 *  JSON object with the properties mergeable and the description if
 *  `mergeable` is false
 */
module.exports = async (pr, context, settings) => {
  let projectName = settings.mergeable.project
  let isMergeable = true
  if (projectName) {
    let projIds = await getProjectIds(context, projectName)
    let projectCards = await getProjectCards(context, projIds)
    const idsFromCards = extractIssueIdsFromCards(pr, projectCards)
    isMergeable = idsFromCards.includes(String(pr.number))

    if (!isMergeable) { // do deep validation
      const issuesPrCloses = issues.checkIfClosesAnIssue(pr.body)

      isMergeable = issuesPrCloses.some(issue => idsFromCards.includes(issue))
    }
  }

  return {
    mergeable: isMergeable,
    description: isMergeable ? null : `Must be in "${projectName}" Project`
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

const getProjectIds = async (context, name) => {
  const nameRegex = new RegExp(name, 'i')
  const res = await context.github.projects.getRepoProjects(
    context.repo()
  )

  return res.data.filter(project => nameRegex.test(project.name)).map(project => project.id)
}

const getProjectCards = async (context, projIds) => {
  let cards = []

  // get all the project columns
  for (let i = 0; i < projIds.length; i++) {
    let res = await context.github.projects.getProjectColumns({project_id: projIds[i]})
    const columnIds = res.data.map(project => project.id)

    res = await Promise.all(columnIds.map(id => context.github.projects.getProjectCards({column_id: id})))
    res.forEach(card => {
      cards = cards.concat(card.data)
    })
  }

  return cards.map(card => card.content_url)
}
