const min = require('../../../../../lib/validators/options_processor/options/min')
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
  const rule = {min: {count: 3}}
  let input = ['A', 'B', 'C']
  let res = min.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {min: {count: 3}}
  const input = ['A', 'B']
  const res = min.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {min: {regex: 3}}
  const input = ['the test']
  try {
    let config = min.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'count' is not provided for 'min' option. Please check README for more information about configuration`)
  }
})
