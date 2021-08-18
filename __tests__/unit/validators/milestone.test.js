const Milestone = require('../../../lib/validators/milestone')
const Helper = require('../../../__fixtures__/unit/helper')

test('should be false when a different milestone is specified', async () => {
  const milestone = new Milestone()
  const settings = {
    do: 'milestone',
    must_include: {
      regex: 'Version 2'
    }
  }
  const validation = await milestone.processValidate(createMockContext({ title: 'Version 1' }), settings)
  expect(validation.status).toBe('fail')
})

test('shoud be false when milestone is set in settings but null in PR', async () => {
  const milestone = new Milestone()
  const settings = {
    do: 'milestone',
    must_include: {
      regex: 'Version 1'
    }
  }
  const validation = await milestone.processValidate(createMockContext(), settings)
  expect(validation.status).toBe('fail')
})

test('description should be correct', async () => {
  const milestone = new Milestone()
  const settings = {
    do: 'milestone',
    must_include: {
      regex: 'Version 1'
    }
  }

  const validation = await milestone.processValidate(createMockContext(), settings)
  expect(validation.validations[0].description).toBe('milestone does not include "Version 1"')
})

test('checks that deep validation works if it closes an issue with milestone requirement', async () => {
  const milestone = new Milestone()
  const settings = {
    do: 'milestone',
    must_include: {
      regex: 'Version 1'
    }
  }

  const validation = await milestone.processValidate(createMockContext(null, 'closes #1', { milestone: { title: 'Version 1' } }), settings)
  expect(validation.status).toBe('pass')
})

test('checks that deep validation return false if it does not closes an issue with milestone requirement', async () => {
  const milestone = new Milestone()
  const settings = {
    do: 'milestone',
    must_include: {
      regex: 'Version 1'
    }
  }
  const validation = await milestone.processValidate(createMockContext(null, 'closes #1', { milestone: { title: 'Version 2' } }), settings)
  expect(validation.status).toBe('fail')
})

const createMockContext = (milestone, body, deepValidation) => {
  return Helper.mockContext({ milestone, body, deepValidation })
}
