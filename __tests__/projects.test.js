const Helper = require('../__fixtures__/helper')
const projects = require('../lib/projects')
const Configuration = require('../lib/configuration')

test('that mergeable is true when PR number is in Project', async () => {
  let validation = await projects(createMockPR({number: 1}), createMockContext(), config('Project One'))
  expect(validation.mergeable).toBe(true)
})

test('that mergeable is false when PR number is not in Project', async () => {
  let validation = await projects(createMockPR({number: 3}), createMockContext(), config('Project One'))
  expect(validation.mergeable).toBe(false)
})

test('test description is correct', async () => {
  let validation = await projects(createMockPR({number: 3}), createMockContext(), config('Project One'))
  expect(validation.mergeable).toBe(false)
  expect(validation.description).toBe('Must be in "Project One" Project')
})

test('test deep validation works', async () => {
  let validation = await projects(
    createMockPR({number: 3, description: 'closes #1'}),
    createMockContext(),
    config('Project One'))
  expect(validation.mergeable).toBe(true)
  expect(validation.description).toBe(null)
})

const createMockPR = ({description, number}) => {
  return Helper.mockContext({body: description, number: number}).payload.pull_request
}

const createMockContext = (data) => {
  const repoProjects = [
    {name: 'Project One', id: 1},
    {name: 'Porject Two', id: 2}
  ]
  const projectColumns = [
    {id: 1}
  ]
  const projectCards = [
    {content_url: 'testRepo/issues/1'},
    {content_url: 'testRepo/issues/2'}
  ]

  return Helper.mockContext({repoProjects: repoProjects, projectColumns: projectColumns, projectCards: projectCards})
}

const config = (projectName) => {
  return (new Configuration(`
  mergeable:
    project: '${projectName}'
`)).settings.mergeable
}
