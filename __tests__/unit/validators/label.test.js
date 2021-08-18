const Label = require('../../../lib/validators/label')
const Helper = require('../../../__fixtures__/unit/helper')

test('validate returns correctly', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_exclude: {
      regex: 'wip'
    }
  }

  let results = await label.processValidate(createMockContext(['wip']), settings)
  expect(results.status).toBe('fail')

  results = await label.processValidate(createMockContext(['a', 'b']), settings)
  expect(results.status).toBe('pass')
})

test('fail gracefully if invalid regex', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_exclude: {
      regex: '@#$@#$@#$'
    }
  }

  const validation = await label.processValidate(createMockContext('WIP'), settings)
  expect(validation.status).toBe('pass')
})

test('mergeable is false if regex found or true if not when there is only one label', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_include: {
      regex: 'Some Label'
    }
  }

  let validation = await label.processValidate(createMockContext('work in progress'), settings)
  expect(validation.status).toBe('fail')

  validation = await label.processValidate(createMockContext('Some Label'), settings)
  expect(validation.status).toBe('pass')
})

test('mergeable is false if regex found or true if not when there are multiple labels', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_include: {
      regex: '456'
    }
  }

  let validation = await label.processValidate(createMockContext(['abc', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('fail')

  validation = await label.processValidate(createMockContext(['Some Label', '123', '456']), settings)
  expect(validation.status).toBe('pass')
})

test('description is correct', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_exclude: {
      regex: 'Work in Progress'
    }
  }

  let validation = await label.processValidate(createMockContext('Work in Progress'), settings)

  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('label does not exclude "Work in Progress"')

  validation = await label.processValidate(createMockContext('Just Label'), settings)
  expect(validation.validations[0].description).toBe("label must exclude 'Work in Progress'")
})

test('mergeable is true if must_include is one of the label', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_include: {
      regex: 'abc'
    }
  }

  let validation = await label.processValidate(createMockContext(['abc', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('pass')

  validation = await label.processValidate(createMockContext(['Some Label', '123', '456']), settings)
  expect(validation.status).toBe('fail')
})

test('mergeable is false if must_exclude is one of the label', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    must_exclude: {
      regex: 'xyz'
    }
  }

  let validation = await label.processValidate(createMockContext(['abc', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('fail')

  validation = await label.processValidate(createMockContext(['Some Label', '123', '456']), settings)
  expect(validation.status).toBe('pass')
})

test('that it validates ends_with correctly', async () => {
  const label = new Label()
  const match = 'test'

  const settings = {
    do: 'label',
    ends_with: {
      match: match
    }
  }

  let labelValidation = await label.processValidate(createMockContext(['Some Label']), settings)
  expect(labelValidation.status).toBe('fail')
  expect(labelValidation.validations[0].description).toBe(`label must end with "${match}"`)

  labelValidation = await label.processValidate(createMockContext(['Label test']), settings)
  expect(labelValidation.status).toBe('pass')
})

test('complex Logic test', async () => {
  const label = new Label()

  const settings = {
    do: 'label',
    or: [{
      and: [{
        must_include: {
          regex: 'release note: yes',
          message: 'Please include release note: yes'
        }
      }, {
        must_include: {
          regex: 'lang\\/core|lang\\/c\\+\\+|lang\\/c#',
          message: 'Please include a language label'
        }
      }]
    }, {
      must_include: {
        regex: 'release note: no',
        message: 'Please include release note: no'
      }
    }]
  }

  let validation = await label.processValidate(createMockContext(['release note: no', 'experimental', 'xyz']), settings)
  expect(validation.status).toBe('pass')

  validation = await label.processValidate(createMockContext(['release note: yes', '123', '456']), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe('((Please include a language label)  ***OR***  Please include release note: no)')

  validation = await label.processValidate(createMockContext(['lang/core', '456']), settings)
  expect(validation.validations[0].description).toBe('((Please include release note: yes)  ***OR***  Please include release note: no)')

  validation = await label.processValidate(createMockContext(['release note: yes', 'lang/core', '456']), settings)
  expect(validation.status).toBe('pass')
})

const createMockContext = (labels) => {
  let labelArray = []
  if (Array.isArray(labels)) {
    labels.forEach((label) => {
      labelArray.push({ name: label })
    })
  } else {
    labelArray = [{ name: labels }]
  }

  return Helper.mockContext({ labels: labelArray })
}
