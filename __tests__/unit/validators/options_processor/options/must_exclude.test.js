const mustExclude = require('../../../../../lib/validators/options_processor/options/must_exclude')

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
  const rule = { must_exclude: { regex: 'test' } }
  const input = ['A', 'B', 'C']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = { must_exclude: { regex: 'test' } }
  const input = ['A', 'B', 'the test']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = { must_exclude: { count: 'test' } }
  const input = ['the test']
  try {
    const config = mustExclude.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Failed to run the test because \'regex\' is not provided for \'must_exclude\' option. Please check README for more information about configuration')
  }
})

test('check "all" sub option works', async () => {
  const rule = { must_exclude: { regex: 'test', all: true } }
  let input = ['A', 'B', 'the test']
  let res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')

  input = ['A', 'B', 'the']
  res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('that regex_flag works as expected', async () => {
  const rule = { must_exclude: { regex: 'test', regex_flag: 'none' } }
  const input = ['A', 'B', 'Test']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return pass if input array meets the criteria', async () => {
  const rule = { must_exclude: { regex: ['test', 'D'] } }
  const input = ['A', 'B', 'C']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input array does not meet the criteria', async () => {
  const rule = { must_exclude: { regex: ['^the', 'F', 'G'] } }
  const input = ['A', 'B', 'the test']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})
