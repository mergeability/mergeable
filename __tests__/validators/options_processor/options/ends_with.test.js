const endsWith = require('../../../../lib/validators/options_processor/options/ends_with')

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
  const rule = {ends_with: {match: 'test'}}
  let input = 'the test'
  let res = endsWith.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')

  input = ['A', 'B', 'the test']
  res = endsWith.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')

  input = ['the test']
  res = endsWith.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {ends_with: {match: 'test'}}
  const input = 'test the'
  const res = endsWith.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {ends_with: {regex: 'test'}}
  const input = 'the test'
  try {
    let config = endsWith.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'match' is not provided for 'ends_with' option. Please check README for more information about configuration`)
  }
})
