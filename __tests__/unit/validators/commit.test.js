const Helper = require('../../../__fixtures__/unit/helper')
const Commit = require('../../../lib/validators/commit')

test('validate returns correctly', async () => {
  const changeset = new Commit()
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

test('oldest_only sub option', async () => {
  const changeset = new Commit()
  const settings = {
    do: 'changeset',
    must_include: {
      regex: '@#$@#$@#$'
    }

  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('fail')
})

test('skip_merge sub option', async () => {
  const changeset = new Commit()
  const settings = {
    do: 'changeset',
    must_include: {
      regex: 'a.js'
    }
  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js', 'a.jsx']), settings)
  expect(validation.status).toBe('pass')
})

test('error handling', async () => {
  const changeset = new Commit()
  const settings = {
    do: 'changeset',
    must_exclude: {
      regex: 'yarn.lock'
    }
  }

  let validation = await changeset.validate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('fail')
})

const createMockContext = (files) => {
  return Helper.mockContext({files: files})
}
