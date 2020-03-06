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
