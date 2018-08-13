const Title = require('../../lib/validators/title')
const Helper = require('../../__fixtures__/helper')

test('validate returns false', () => {
  let title = new Title()

  let settings = {
    do: 'title',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    },
    must_exclude: {
      regex: 'wip'
    }
  }
  let result = title.validate(mockContext('wip'), settings)
  expect(result.status).toBe('fail')

  result = title.validate(mockContext('(feat) something else'), settings)
  expect(result.status).toBe('pass')
})

const mockContext = title => {
  let context = Helper.mockContext({ title: title })
  return context
}
