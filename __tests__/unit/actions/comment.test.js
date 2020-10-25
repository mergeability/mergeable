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

  let result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  expect(context.github.issues.createComment.mock.calls.length).toBe(1)
  expect(context.github.issues.createComment.mock.calls[0][0].body).toBe(`Your run has returned the following status: pass`)
})

test('that comment is created three times when result contain three issues found to be acted on', async () => {
  const comment = new Comment()
  const context = createMockContext([], 'repository')
  context.event = 'schedule'
  let schedulerResult = {...result}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
      pulls: []
    }
  }]
  await comment.afterValidate(context, settings, '', schedulerResult)
  expect(context.github.issues.createComment.mock.calls.length).toBe(3)
})

test('check that old comments from Mergeable are deleted if they exists', async () => {
  const comment = new Comment()

  const listComments = [{
    id: '1',
    user: {
      login: 'test-1'
    }
  },
  {
    id: '2',
    user: {
      login: 'Mergeable[bot]'
    }
  }]
  const context = createMockContext(listComments)

  let result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.github.issues.deleteComment.mock.calls[0][0].comment_id).toBe(`2`)
})

test('check that old comments checks toLowerCase of the Bot name', async () => {
  const comment = new Comment()

  const listComments = [{
    id: '1',
    user: {
      login: 'test-1'
    }
  },
  {
    id: '2',
    user: {
      login: 'mergeable[bot]'
    }
  }]
  const context = createMockContext(listComments)

  let result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.github.issues.deleteComment.mock.calls[0][0].comment_id).toBe(`2`)
})

test('error handling includes removing old error comments and creating new error comment', async () => {
  const comment = new Comment()

  const listComments = [{
    id: '1',
    user: {
      login: 'test-1'
    }
  },
  {
    id: '2',
    user: {
      login: 'Mergeable[bot]'
    },
    body: 'This is a normal comment'
  },
  {
    id: '3',
    user: {
      login: 'Mergeable[bot]'
    },
    body: 'This is an Error comment'
  }]
  const context = createMockContext(listComments)
  const payload = {
    body: 'This is a new error comment'
  }

  await comment.handleError(context, payload)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.github.issues.deleteComment.mock.calls[0][0].comment_id).toBe(`3`)
  expect(context.github.issues.createComment.mock.calls[0][0].body).toBe(payload.body)
})

test('remove error comments only remove comments that includes "error" ', async () => {
  const comment = new Comment()

  const listComments = [{
    id: '1',
    user: {
      login: 'test-1'
    }
  },
  {
    id: '2',
    user: {
      login: 'Mergeable[bot]'
    },
    body: 'This is a normal comment'
  },
  {
    id: '3',
    user: {
      login: 'Mergeable[bot]'
    },
    body: 'This is an Error comment'
  }]
  const context = createMockContext(listComments)

  await comment.removeErrorComments(context)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.github.issues.deleteComment.mock.calls[0][0].comment_id).toBe(`3`)
})

test('check that leave_old_comment option works', async () => {
  const comment = new Comment()

  const settings = {
    payload: {
      body: `Your run has returned the following status: {{status}}`
    },
    leave_old_comment: true
  }

  const listComments = [{
    id: '1',
    user: {
      login: 'test-1'
    }
  },
  {
    id: '2',
    user: {
      login: 'Mergeable[bot]'
    }
  }]
  const context = createMockContext(listComments)

  let result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(0)
})

test('remove Error comment fail gracefully if payload does not exists', async () => {
  const comment = new Comment()

  const context = {
    payload: {},
    github: {
      issues: {
        deleteComment: jest.fn()
      }
    }
  }

  await comment.removeErrorComments(context)
  expect(context.github.issues.deleteComment.mock.calls.length).toBe(0)
})

test('error handling includes removing old error comments and creating new error comment', async () => {
  const comment = new Comment()
  const context = createMockContext()
  const settings = {
    payload: {
      body: '@author , do something!'
    }
  }

  await comment.afterValidate(context, settings, '', result)
  expect(context.github.issues.createComment.mock.calls[0][0].body).toBe('creator , do something!')
})

const createMockContext = (listComments, event = undefined) => {
  let context = Helper.mockContext({listComments, event})

  context.github.issues.createComment = jest.fn()
  context.github.issues.deleteComment = jest.fn()
  return context
}
