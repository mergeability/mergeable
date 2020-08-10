const or = require('../../../../../lib/validators/options_processor/options/or')

const validatorContext = {
  name: 'OptionName',
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
test('return pass if input passes one of the OR conditions', async () => {
  const rule = { or: [
    { must_include: {regex: 'A'} },
    { must_exclude: {regex: 'B'} }
  ]}
  let input = ['A', 'C']
  let res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if none of the input passes one of the OR conditions', async () => {
  const rule = { or: [
    {required: { reviewers: ['user1'] }},
    {required: { reviewers: ['user2'] }}
  ]}
  let input = ['user0', 'user5', 'user3']
  let res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {and: {must_include: {regex: 'A'}}}
  const input = 'the test'
  try {
    let config = or.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Input type invalid, expected array type as input')
  }
})

test('return error if option is not valid', async () => {
  const rule = {or: [{must_include: {regexs: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['A']
  const res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})

test('return error if sub option is not valid', async () => {
  const rule = {or: [{must_inclde: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['A']
  const res = or.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})
