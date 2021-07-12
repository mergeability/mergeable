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

  let validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('pass')

  validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'b.js']), settings)
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

  const validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
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

  const validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js', 'a.jsx']), settings)
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

  const validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
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

  const validation = await changeset.processValidate(createMockContext(['package-lock.json', 'yarn.lock', 'package.json', 'a.js']), settings)
  expect(validation.status).toBe('pass')
})

test('correct files are considered based on file status setting', async () => {
  const changeset = new Changeset()
  const settings = {
    do: 'changeset',
    files: {
      added: true, 
      modified: false
    },
    must_include: {
      regex: 'added-file.js'
    },
    must_exclude: {
      regex: '(modified-file.py)|(deleted-file.ts)'
    }
  }

  const validation = await changeset.processValidate(createMockContext([{
    filename: 'added-file.js',
    status: 'added',
    additions: 1,
    changes: 0,
    deletions: 0
  }, {
    filename: 'modified-file.py',
    status: 'modified',
    additions: 0,
    changes: 1,
    deletions: 0
  }, {
    filename: 'deleted-file.ts',
    status: 'deleted',
    additions: 0,
    changes: 0,
    deletions: 1
  }]), settings)

  expect(validation.status).toBe('pass')
})

const createMockContext = (files) => {
  return Helper.mockContext({ files: files })
}
