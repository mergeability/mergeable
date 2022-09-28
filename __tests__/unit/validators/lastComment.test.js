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

test('complex Logic test', async () => {
  const lastComment = new LastComment()

  const settings = {
    do: 'lastComment',
    or: [{
      and: [{
        must_include: {
          regex: 'release note: yes',
          message: 'Please include release note: yes'
        }
      }, {
        must_include: {
          regex: 'lang\\/core|lang\\/c\\+\\+|lang\\/c#',
          message: 'Please include a language comment'
        }
      }]
    }, {
      must_include: {
        regex: 'release note: no',
        message: 'Please include release note: no'
      }
    }]
  }

  let validation = await lastComment.processValidate(createMockContext(['experimental', 'xyz', 'release note: no']), settings)
  expect(validation.status).toBe('pass')

  validation = await lastComment.processValidate(createMockContext(['123', '456', 'release note: yes']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('((Please include a language comment)  ***OR***  Please include release note: no)')

  validation = await lastComment.processValidate(createMockContext(['456', 'lang/core']), settings)
  expect(validation.validations[0].description).toBe('((Please include release note: yes)  ***OR***  Please include release note: no)')
})

function createMockContext (comments) {
  return Helper.mockContext({ listComments: Array.isArray(comments) ? comments.map(comment => ({ body: comment })) : [{ body: comments }] })
}
