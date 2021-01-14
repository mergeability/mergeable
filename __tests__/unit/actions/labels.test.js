const Labels = require('../../../lib/actions/labels')
const Helper = require('../../../__fixtures__/unit/helper')
const UnSupportedSettingError = require('../../../lib/errors/unSupportedSettingError')

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
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
})

test('check that labels setting defaults to add mode', async () => {
  const labels = new Labels()
  const context = createMockContext()

  const settings = {
    labels: ['testLabel', '2ndTestLabel']
  }

  await labels.afterValidate(context, settings)
  expect(context.octokit.issues.addLabels.mock.calls.length).toBe(1)
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
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
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
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
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['test2', 'label1']})
})

test('check that issues from scheduler are labelled', async () => {
  const labels = new Labels()
  const context = createMockContext([], 'schedule')
  const settings = {
    labels: ['testLabel', '2ndTestLabel']
  }
  let schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.addLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.addLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.octokit.issues.addLabels.mock.calls[1][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.octokit.issues.addLabels.mock.calls[2][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
})

test('check that labels from scheduler are deleted', async () => {
  const labels = new Labels()
  const context = createMockContext(['testLabel', '2ndTestLabel', 'test1', 'test2', 'label1', 'Label2', 'anotherLabel2'], 'schedule')
  const settings = {
    labels: ['*Label*', 'test1'],
    mode: 'delete'
  }
  let schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['test2', 'label1']})
  expect(context.octokit.issues.setLabels.mock.calls[1][0].labels).toStrictEqual({'labels': ['test2', 'label1']})
  expect(context.octokit.issues.setLabels.mock.calls[2][0].labels).toStrictEqual({'labels': ['test2', 'label1']})
})

test('check that labels from scheduler are set', async () => {
  const labels = new Labels()
  const context = createMockContext([], 'schedule')
  const settings = {
    labels: ['testLabel', '2ndTestLabel'],
    mode: 'replace'
  }
  let schedulerResult = {}
  schedulerResult.validationSuites = [{
    schedule: {
      issues: [{number: 1, user: {login: 'scheduler'}}, {number: 2, user: {login: 'scheduler'}}, {number: 3, user: {login: 'scheduler'}}],
      pulls: []
    }
  }]
  await labels.afterValidate(context, settings, '', schedulerResult)
  expect(context.octokit.issues.setLabels.mock.calls.length).toBe(3)
  expect(context.octokit.issues.setLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.octokit.issues.setLabels.mock.calls[1][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.octokit.issues.setLabels.mock.calls[2][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
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
