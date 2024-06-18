const Labels = require('../../../lib/actions/labels')
const Helper = require('../../../__fixtures__/unit/helper')
const UnSupportedSettingError = require('../../../lib/errors/unSupportedSettingError')

test.each([
  undefined,
  'pull_request',
  'issues',
  'issue_comment',
  'schedule'
])('check that close is called for %s events', async (eventName) => {
  const labels = new Labels()
  const context = createMockContext([], eventName)
  const settings = {
    add: ['a label']
  }
  const schedulerResult = {
    validationSuites: [{
      schedule: {
        issues: [{ number: 1, user: { login: 'scheduler' } }],
        pulls: []
      }
    }]
  }

  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
})

test('check that replace replaces existing labels', async () => {
  const labels = new Labels()
  const context = createMockContext(['drop_label'])

  const settings = {
    replace: ['work in progress', 'development']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(settings.replace)
})

test('check that add appends to existing labels', async () => {
  const labels = new Labels()
  const context = createMockContext(['another label', 'test label'])

  const settings = {
    add: ['production', 'deploy']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['another label', 'test label', 'production', 'deploy'])
})

test('check that delete removes from existing labels', async () => {
  const labels = new Labels()
  const context = createMockContext(['another label', 'test label', 'delete me', 'delete this too'])

  const settings = {
    delete: ['delete me', 'delete this too']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['another label', 'test label'])
})

test('check the order of replace, add, delete', async () => {
  const labels = new Labels()
  const context = createMockContext(['original label', 'another label'])

  // order of operations is replace, then add, then delete
  const settings = {
    delete: ['not present', 'more adds'],
    add: ['addition', 'more adds'],
    replace: ['test present', 'not present']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['test present', 'addition'])
})

test('check that settings can be a single value', async () => {
  const labels = new Labels()
  const context = createMockContext(['original label', 'another label', 'delete me'])

  const settings = {
    delete: 'deletion',
    add: 'addition',
    replace: 'replace'
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['replace', 'addition'])
})

test('check that unknown mode throw errors', async () => {
  const labels = new Labels()
  const context = Helper.mockContext()
  const settings = {
    labels: ['testLabel', '2ndTestLabel'],
    mode: 'DNE'
  }
  expect(labels.afterValidate(context, settings)).rejects.toThrow(UnSupportedSettingError)
})

test('check that labels setting accepts an array', async () => {
  const labels = new Labels()
  const context = Helper.mockContext()

  const settings = {
    labels: ['testLabel', '2ndTestLabel'],
    mode: 'add'
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.addLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
})

test('check that labels setting defaults to add mode', async () => {
  const labels = new Labels()
  const context = createMockContext()

  const settings = {
    labels: ['testLabel', '2ndTestLabel']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.addLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
})

test('check that set mode works', async () => {
  const labels = new Labels()
  const context = createMockContext()

  const settings = {
    labels: ['testLabel', '2ndTestLabel'],
    mode: 'replace'
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
})

test('check that delete mode works', async () => {
  const labels = new Labels()
  const context = createMockContext(['testLabel', '2ndTestLabel', 'test1', 'test2', 'label1', 'Label2', 'anotherLabel2'])

  const settings = {
    labels: ['*Label*', 'test1'],
    mode: 'delete'
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['test2', 'label1'])
})

test('check that issues from scheduler are labelled', async () => {
  const labels = new Labels()
  const context = createMockContext([], 'schedule')
  const settings = {
    labels: ['testLabel', '2ndTestLabel']
  }
  const schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.addLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
  expect(context.octokit.issues.addLabels.mock.calls[1][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
  expect(context.octokit.issues.addLabels.mock.calls[2][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
})

test('check that labels from scheduler are deleted', async () => {
  const labels = new Labels()
  const context = createMockContext(['testLabel', '2ndTestLabel', 'test1', 'test2', 'label1', 'Label2', 'anotherLabel2'], 'schedule')
  const settings = {
    labels: ['*Label*', 'test1'],
    mode: 'delete'
  }
  const schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['test2', 'label1'])
  expect(context.octokit.issues.setLabels.mock.calls[1][0].labels).toStrictEqual(['test2', 'label1'])
  expect(context.octokit.issues.setLabels.mock.calls[2][0].labels).toStrictEqual(['test2', 'label1'])
})

test('check that labels from scheduler are set', async () => {
  const labels = new Labels()
  const context = createMockContext([], 'schedule')
  const settings = {
    labels: ['testLabel', '2ndTestLabel'],
    mode: 'replace'
  }
  const schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{ number: 1, user: { login: 'scheduler' } }, { number: 2, user: { login: 'scheduler' } }, { number: 3, user: { login: 'scheduler' } }],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
  expect(context.octokit.issues.setLabels.mock.calls[1][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
  expect(context.octokit.issues.setLabels.mock.calls[2][0].labels).toStrictEqual(['testLabel', '2ndTestLabel'])
})

const createMockContext = (labels = [], eventName = undefined) => {
  let labelArray = []
  if (Array.isArray(labels)) {
    labels.forEach((label) => {
      labelArray.push({ name: label })
    })
  } else {
    labelArray = [{ name: labels }]
  }

  return Helper.mockContext({ labels: labelArray, eventName })
}
