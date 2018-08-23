const or = require('../../../../lib/validators/options_processor/options/or')

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
test('return pass if input begins with the rule', async () => {
  const rule = {or: [{must_include: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  let input = ['A']
  let res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not begins with the rule', async () => {
  const rule = {or: [{must_include: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['B', 'D']
  const res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {or: {must_include: {regex: 'A'}}}
  const input = 'the test'
  const res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})
