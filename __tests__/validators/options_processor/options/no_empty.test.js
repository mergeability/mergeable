const noEmpty = require('../../../../lib/validators/options_processor/options/no_empty')

const validatorContext = {
  name: 'label',
  supportedOptions: [
    'and',
    'or',
    'begins_with',
    'ends_with',
    'max',
    'min',
    'must_exclude',
    'must_include',
    'no_empty',
    'required']
}
test('return pass if input meets the criteria', async () => {
  const rule = {no_empty: {enabled: true}}
  let input = 'NOT EMPTY'
  let res = noEmpty.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')

  input = ['']
  res = noEmpty.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {no_empty: {enabled: true}}
  let input = ''
  let res = noEmpty.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')

  input = []
  res = noEmpty.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {no_empty: {regex: true}}
  const input = 'the test'
  try {
    let config = noEmpty.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'enabled' is not provided for 'no_empty' option. Please check README for more information about configuration`)
  }
})
