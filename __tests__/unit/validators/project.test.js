const Project = require('../../../lib/validators/project')
const Helper = require('../../../__fixtures__/unit/helper')

const settings = {
  do: 'project',
  must_include: {
    regex: 'Project One'
  }
}

test('that mergeable is true when PR number is in Project', async () => {
  const projects = new Project()
  let validation = await projects.validate(createMockContext({number: 1}), settings)
  expect(validation.status).toBe('pass')
})

test('that mergeable is false when PR number is not in Project', async () => {
  const projects = new Project()
  let validation = await projects.validate(createMockContext({number: 3}), settings)
  expect(validation.status).toBe('fail')
})

test('test description is correct', async () => {
  const projects = new Project()
  let validation = await projects.validate(createMockContext({number: 3}), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('Must be in the "Project One" project.')
})

test('test deep validation works', async () => {
  const projects = new Project()
  let validation = await projects.validate(createMockContext({number: 3, description: 'closes #1'}), settings)
  expect(validation.status).toBe('pass')
  expect(validation.validations[0].description).toBe('Required Project is present')
})

const createMockContext = ({description, number}) => {
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

  return Helper.mockContext({body: description, number: number, repoProjects: repoProjects, projectColumns: projectColumns, projectCards: projectCards})
}
