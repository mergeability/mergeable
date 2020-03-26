const and = require('../../../../../lib/validators/options_processor/options/and')

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
  const rule = {and: [{must_include: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  let input = ['A', 'C']
  let res = and.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not begins with the rule', async () => {
  const rule = {and: [{must_include: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['B']
  const res = and.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {and: {must_include: {regex: 'A'}}}
  const input = 'the test'
  try {
    let config = and.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Input type invalid, expected array type as input')
  }
})

test('return error if option is not valid', async () => {
  const rule = {and: [{must_include: {regexs: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['B']
  const res = and.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})

test('return error if sub option is not valid', async () => {
  const rule = {and: [{must_inclde: {regex: 'A'}}, {must_exclude: {regex: 'B'}}]}
  const input = ['B']
  const res = and.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
})

test('return error if multiple sub option is not valid', async () => {
  const rule = {and: [{must_inclde: {regex: 'A'}}, {must_excalude: {regex: 'B'}}]}
  const input = ['B']
  const res = and.process(validatorContext, input, rule)
  expect(res.status).toBe('error')
  expect(res.description).toBe('Error occurred: \n' +
    `- The 'must_inclde' option is not supported for 'label' validator, please see README for all available options \n` +
    `- The 'must_excalude' option is not supported for 'label' validator, please see README for all available options \n`
    )
})
