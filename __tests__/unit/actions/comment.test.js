const Comment = require('../../../lib/actions/comment')
const Helper = require('../../../__fixtures__/unit/helper')

const settings = {
  payload: {
    body: `Your run has returned the following status: {{status}}`
  }
}

let result = {
  status: 'pass',
  validations: [{
    status: 'pass',
    name: 'Label'
  }]
}

test('check that comment created when afterValidate is called with proper parameter', async () => {
  const comment = new Comment()
  const context = createMockContext()

  await comment.afterValidate(context, settings, result)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
  expect(context.github.issues.createComment.mock.calls[0][0].body).toBe(`Your run has returned the following status: pass`)
})

test('that comment is created three times when result contain three issues found to be acted on', async () => {
  const comment = new Comment()
  const context = createMockContext()

  result.validationSuites = [{
    schedule: {
      issues: [{number: 1}, {number: 2}, {number: 3}],
      pulls: []
    }
  }]
  await comment.afterValidate(context, settings, result)
  expect(context.github.issues.createComment.mock.calls.length).toBe(3)
})

const createMockContext = () => {
  let context = Helper.mockContext()

  context.github.issues.createComment = jest.fn()
  return context
}
