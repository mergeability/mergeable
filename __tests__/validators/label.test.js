const Label = require('../../lib/validators/label')
const Helper = require('../../__fixtures__/helper')

test('validate returns correctly', async ()=> {
  let label = new Label()

  let settings = {
    do: 'label',
    must_exclude: 'wip'
  }

  let results = await label.validate(createMockContext(['wip']), settings)
  expect(results.mergeable).toBe(false)

  results = await label.validate(createMockContext(['a','b']), settings)
  expect(results.mergeable).toBe(true)

})

const createMockContext = (labels) => {
  let labelArray = []
  if (Array.isArray(labels)) {
    labels.forEach((label) => {
      labelArray.push({ name: label })
    })
  } else {
    labelArray = [{ name: labels }]
  }

  return Helper.mockContext({ labels: labelArray })
}
