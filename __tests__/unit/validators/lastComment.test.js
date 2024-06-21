const LastComment = require('../../../lib/validators/lastComment')
const Helper = require('../../../__fixtures__/unit/helper')

test('validate returns correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'exclude this'
    }
  }

  let results = await lastComment.processValidate(createMockContext(['exclude this']), settings)
  expect(results.status).toBe('fail')

  results = await lastComment.processValidate(createMockContext(['a', 'b']), settings)
  expect(results.status).toBe('pass')
})

test('validate applies user exclusions correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'exclude this'
    },
    comment_author: {
      none_of: ['exclude_author']
    }
  }

  let results = await lastComment.processValidate(createMockContext(['exclude this'], ['exclude_author']), settings)
  // must_exclude is not applied since the commenter is excluded
  expect(results.status).toBe('pass')

  results = await lastComment.processValidate(createMockContext(['exclude this'], ['some[bot]']), settings)
  // must_exclude is not applied since the commenting bot is excluded
  expect(results.status).toBe('pass')

  // must_exclude has no match
  results = await lastComment.processValidate(createMockContext(['a', 'b'], ['user_a', 'user_b']), settings)
  expect(results.status).toBe('pass')

  // must_exclude is applied to one comment since the commenter is not in the excluded list
  results = await lastComment.processValidate(createMockContext(['a', 'exclude this'], ['user_a', 'user_b']), settings)
  expect(results.status).toBe('fail')
})

test('validate applies bot exclusions correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'a bot comment'
    },
    comment_author: {
      no_bots: true
    }
  }

  // must_exclude is not applied since the commenter is excluded
  let results = await lastComment.processValidate(createMockContext(['a bot comment'], ['some[bot]']), settings)
  expect(results.status).toBe('pass')

  // must_exclude has no match
  results = await lastComment.processValidate(createMockContext(['a', 'b'], ['some[bot]', 'user_b']), settings)
  expect(results.status).toBe('pass')

  // must_exclude is applied to one comment since the commenter is not in the excluded list
  results = await lastComment.processValidate(createMockContext(['a', 'a bot comment'], ['some[bot]', 'user_b']), settings)
  expect(results.status).toBe('fail')
})

test('validate applies bot exclusions correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'a bot comment'
    },
    comment_author: {
      none_of: ['angry[bot]'],
      no_bots: false
    }
  }

  // must_exclude is applied since the commenting bot is not excluded
  let results = await lastComment.processValidate(createMockContext(['a bot comment'], ['some[bot]']), settings)
  expect(results.status).toBe('fail')

  // must_exclude is not applied since the commenting bot is explicitly excluded
  results = await lastComment.processValidate(createMockContext(['a bot comment'], ['angry[bot]']), settings)
  expect(results.status).toBe('pass')

  // must_exclude has no match
  results = await lastComment.processValidate(createMockContext(['a', 'b'], ['user_a', 'user_b']), settings)
  expect(results.status).toBe('pass')

  // must_exclude is applied to one comment since the commenter is not in the excluded list
  results = await lastComment.processValidate(createMockContext(['a', 'a bot comment'], ['user_a', 'user_b']), settings)
  expect(results.status).toBe('fail')
})

test('validate applies @author exclusions correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'exclude this'
    },
    comment_author: {
      none_of: ['@author']
    }
  }

  let results = await lastComment.processValidate(createMockContext(['exclude this'], ['creator']), settings)
  // must_exclude is not applied since the commenter is excluded
  expect(results.status).toBe('pass')

  // must_exclude is applied to one comment since the commenter is not in the excluded list
  results = await lastComment.processValidate(createMockContext(['a', 'exclude this'], ['creator', 'user_b']), settings)
  expect(results.status).toBe('fail')
})

test('validate applies @author inclusions correctly', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'exclude this'
    },
    comment_author: {
      one_of: ['@author']
    }
  }

  let results = await lastComment.processValidate(createMockContext(['exclude this'], ['creator']), settings)
  // must_exclude is applied since the commenter is included
  expect(results.status).toBe('fail')

  // must_exclude is applied to one comment since the commenter is in the included list
  results = await lastComment.processValidate(createMockContext(['a', 'exclude this'], ['creator', 'user_b']), settings)
  expect(results.status).toBe('fail')
})

test('fail gracefully if invalid regex', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: '@#$@#$@#$'
    }
  }

  const validation = await lastComment.processValidate(createMockContext('WIP'), settings)
  expect(validation.status).toBe('pass')
})

test('description is correct', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'Work in Progress'
    }
  }

  let validation = await lastComment.processValidate(createMockContext('Work in Progress'), settings)

  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('lastComment does not exclude "Work in Progress"')

  validation = await lastComment.processValidate(createMockContext('Just lastComment'), settings)
  expect(validation.validations[0].description).toBe("lastComment must exclude 'Work in Progress'")
})

test('mergeable is true if must_include is the last comment', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_include: {
      regex: 'xyz'
    }
  }

  let validation = await lastComment.processValidate(createMockContext(['abc', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('pass')

  validation = await lastComment.processValidate(createMockContext(['Some lastComment', 'xyz', '456']), settings)
  expect(validation.status).toBe('fail')
})

test('mergeable is false if must_exclude is one of the lastComment', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_exclude: {
      regex: 'xyz'
    }
  }

  let validation = await lastComment.processValidate(createMockContext(['abc', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('fail')

  validation = await lastComment.processValidate(createMockContext(['Some lastComment', 'xyz', '456']), settings)
  expect(validation.status).toBe('pass')
})

test('mergeable is true if single comment got edited, disregarding whether its the last comment', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    must_include: {
      regex: 'xyz'
    },
    must_exclude: {
      regex: 'ignore'
    }
  }

  let validation = await lastComment.processValidate(createMockContext(['abc', 'experimental', 'xyz'], undefined, 'issue_comment'), settings)
  // must_include is applied for the last comment, when triggered by an edit operation
  expect(validation.status).toBe('pass')

  validation = await lastComment.processValidate(createMockContext(['abc', 'xyz', '456'], undefined, 'issue_comment'), settings)
  // must_include is applied although its not the last comment, when triggered by an edit operation
  expect(validation.status).toBe('pass')
})

test('complex Logic test', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    comment_author: {
      none_of: ['e1'],
      no_bots: false
    },
    or: [
      {
        and: [
          {
            must_include: {
              regex: 'release note: yes',
              message: 'Please include release note: yes'
            }
          },
          {
            must_include: {
              regex: 'lang\\/core|lang\\/c\\+\\+|lang\\/c#',
              message: 'Please include a language comment'
            }
          }
        ]
      },
      {
        must_include: {
          regex: 'release note: no',
          message: 'Please include release note: no'
        }
      }
    ]
  }

  let validation = await lastComment.processValidate(createMockContext(['experimental', 'xyz', 'release note: no'], ['u1', 'u1', 'u1']), settings)
  expect(validation.status).toBe('pass')

  validation = await lastComment.processValidate(createMockContext(['123', '456', 'release note: yes'], ['u1', 'u1', 'u1']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('((Please include a language comment)  ***OR***  Please include release note: no)')

  validation = await lastComment.processValidate(createMockContext(['456', 'lang/core'], ['u1', 'u1']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('((Please include release note: yes)  ***OR***  Please include release note: no)')

  // correct comments are ignored since the commenter is excluded
  validation = await lastComment.processValidate(createMockContext(['lang/core', 'release note: yes'], ['e1', 'e1']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('((Please include a language comment)  ***OR***  Please include release note: no)')
})

function createMockContext (comments, commenters, eventname = 'pull_request') {
  const constructComment = (comment, commenter) => {
    const dataComment = {
      body: comment,
      user: { login: commenter || 'creator' }
    }
    return dataComment
  }

  return Helper.mockContext({
    eventName: eventname,
    issueComment: constructComment(comments, commenters),
    comments: Array.isArray(comments)
      ? comments.map((comment, idx) => constructComment(comment, commenters ? commenters[idx] : undefined))
      : [constructComment(comments, commenters)]
  })
}
