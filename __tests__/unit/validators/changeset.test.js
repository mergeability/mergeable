const Helper = require('../../../__fixtures__/unit/helper')
const Changeset = require('../../../lib/validators/changeset')

test('validate returns correctly', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    must_exclude: {
      regex: 'b.js'
    }

  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('pass')

  validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'b.js']), settings)
  expect(validation.status).toBe('fail')
})

test('fail gracefully if invalid regex', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    must_include: {
      regex: '@#$@#$@#$'
    }

  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('fail')
})

test('mergeable is true if must_include is one of the label', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    must_include: {
      regex: 'a.js'
    }
  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js', 'a.jsx']), settings)
  expect(validation.status).toBe('pass')
})

test('mergeable is false if must_exclude is one of the label', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    must_exclude: {
      regex: 'yarn.lock'
    }
  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('fail')
})

test('that it validates ends_with correctly', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    ends_with: {
      match: 'lock'
    }
  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('pass')
})

const createMockContext = (files) => {
  return Helper.mockContext({files: files})
}
