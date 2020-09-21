const Labels = require('../../../lib/actions/labels')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that labels setting accepts an array', async () => {
  const labels = new Labels()
  const context = Helper.mockContext()

  const settings = {
    labels: ['testLabel', '2ndTestLabel']
  }

  await labels.afterValidate(context, settings)
  expect(context.github.issues.addLabels.mock.calls.length).toBe(1)
  expect(context.github.issues.addLabels.mock.calls[0][0].labels.labels[0]).toBe('testLabel')
  expect(context.github.issues.addLabels.mock.calls[0][0].labels.labels[1]).toBe('2ndTestLabel')
})

test('check that issues from scheduler are labelled', async () => {
  const labels = new Labels()
  const context = Helper.mockContext({event: 'schedule'})
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
  expect(context.github.issues.addLabels.mock.calls.length).toBe(3)
  expect(context.github.issues.addLabels.mock.calls[0][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.github.issues.addLabels.mock.calls[1][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
  expect(context.github.issues.addLabels.mock.calls[2][0].labels).toStrictEqual({'labels': ['testLabel', '2ndTestLabel']})
})
