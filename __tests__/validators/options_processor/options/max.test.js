const max = require('../../../../lib/validators/options_processor/options/max')

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
  const rule = {max: {count: 3}}
  let input = ['A', 'B', 'C']
  let res = max.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {max: {count: 3}}
  const input = ['A', 'B', 'C', 'D']
  const res = max.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {max: {regex: 3}}
  const input = ['the test']
  const res = max.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})
