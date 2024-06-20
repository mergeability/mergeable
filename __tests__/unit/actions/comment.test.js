const Comment = require('../../../lib/actions/comment')
const Helper = require('../../../__fixtures__/unit/helper')

const settings = {
  payload: {
    body: 'Your run has returned the following status: {{status}}'
  }
}

const result = {
  status: 'pass',
  validations: [{
    status: 'pass',
    name: 'Label'
  }]
}

test.each([
  undefined,
  'pull_request',
  'issues',
  'issue_comment',
  'schedule'
])('check that comment is called for %s events', async (eventName) => {
  const comment = new Comment()
  const context = createMockContext([], eventName)
  const schedulerResult = { ...result }
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]

  await comment.afterValidate(context, settings, '', schedulerResult)
  await Helper.flushPromises()

  expect(context.octokit.issues.createComment.mock.calls.length).toBe(1)
})

test('check that comment created when afterValidate is called with proper parameter', async () => {
  const comment = new Comment()
  const context = createMockContext([])

  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  await Helper.flushPromises()

  expect(context.octokit.issues.createComment.mock.calls.length).toBe(1)
  expect(context.octokit.issues.createComment.mock.calls[0][0].body).toBe('Your run has returned the following status: pass')
})

test('that comment is created three times when result contain three issues found to be acted on', async () => {
  const comment = new Comment()
  const context = createMockContext([], 'schedule', 'repository')
  const schedulerResult = { ...result }
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]
  await comment.afterValidate(context, settings, '', schedulerResult)
  await Helper.flushPromises()

  expect(context.octokit.issues.createComment.mock.calls.length).toBe(3)
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

  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  await Helper.flushPromises()

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.octokit.issues.deleteComment.mock.calls[0][0].comment_id).toBe('2')
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

  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)
  await Helper.flushPromises()

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.octokit.issues.deleteComment.mock.calls[0][0].comment_id).toBe('2')
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

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.octokit.issues.deleteComment.mock.calls[0][0].comment_id).toBe('3')
  expect(context.octokit.issues.createComment.mock.calls[0][0].body).toBe(payload.body)
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

  await comment.removeErrorComments(context, comment)

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(1)
  expect(context.octokit.issues.deleteComment.mock.calls[0][0].comment_id).toBe('3')
})

test('check that leave_old_comment option works', async () => {
  const comment = new Comment()

  const settings = {
    payload: {
      body: 'Your run has returned the following status: {{status}}'
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

  const result = {
    status: 'pass',
    validations: [{
      status: 'pass',
      name: 'Label'
    }]
  }

  await comment.afterValidate(context, settings, '', result)

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(0)
})

test('remove Error comment fail gracefully if payload does not exists', async () => {
  const comment = new Comment()

  const context = {
    payload: {},
    octokit: {
      issues: {
        deleteComment: jest.fn()
      }
    }
  }

  await comment.removeErrorComments(context)

  expect(context.octokit.issues.deleteComment.mock.calls.length).toBe(0)
})

test('special annotations are replaced', async () => {
  const comment = new Comment()
  const context = createMockContext([])
  const settings = {
    payload: {
      body: '@author @sender @bot @repository @action {{formatDate created_at}} , do something!'
    }
  }

  await comment.afterValidate(context, settings, '', result)
  await Helper.flushPromises()

  expect(context.octokit.issues.createComment.mock.calls[0][0].body).toBe('creator initiator Mergeable[bot] fullRepoName opened Jun 15, 2024, 7:14 PM , do something!')
})

const createMockContext = (comments, eventName = undefined, event = undefined) => {
  const createdAt = '2024-06-15T19:14:00Z'
  const context = Helper.mockContext({ comments, eventName, createdAt, event })

  context.octokit.issues.createComment = jest.fn()
  context.octokit.issues.deleteComment = jest.fn()
  return context
}
