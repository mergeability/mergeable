const Close = require('../../../lib/actions/close')
const Helper = require('../../../__fixtures__/unit/helper')

test('check that labels setting accepts an array', async () => {
  const close = new Close()
  const context = Helper.mockContext()

  await close.afterValidate(context)
  expect(context.github.issues.update.mock.calls.length).toBe(1)
  expect(context.github.issues.update.mock.calls[0][0].state).toBe('closed')
})
