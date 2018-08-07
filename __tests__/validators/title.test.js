const Title = require('../../lib/validators/title')
const Helper = require('../../__fixtures__/helper')

test('validate returns false', () => {
  let title = new Title()

  let settings = {
    do: 'title',
    must_include: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)',
    must_exclude: 'wip'
  }

  expect(title.validate(mockContext('wip'), settings).mergeable).toBe(false)
  expect(title.validate(mockContext('(feat) something else'), settings).mergeable).toBe(true)
})

const mockContext = title => {
  let context = Helper.mockContext({ title: title })
  return context
}
