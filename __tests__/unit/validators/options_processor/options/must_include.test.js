const mustInclude = require('../../../../../lib/validators/options_processor/options/must_include')

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
  const rule = { must_include: { regex: 'test' } }
  const input = ['A', 'B', 'the test']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = { must_include: { regex: 'test', message: 'failed Test' } }
  const input = ['A', 'B']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
  expect(res.description).toBe('failed Test')
})

test('return error if inputs are not in expected format', async () => {
  const rule = { must_include: { count: 'test' } }
  const input = ['the test']
  try {
    const config = mustInclude.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Failed to run the test because \'regex\' is not provided for \'must_include\' option. Please check README for more information about configuration')
  }
})

test('check "all" sub option works', async () => {
  const rule = { must_include: { regex: 'test', all: true } }
  let input = ['A test', 'B', 'the test']
  let res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')

  input = ['A test', 'B test', 'the test']
  res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('that regex_flag works as expected', async () => {
  const rule = { must_include: { regex: 'test', regex_flag: 'none' } }
  const input = ['A', 'B', 'Test']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return pass if input array meets the criteria', async () => {
  const rule = { must_include: { regex: ['^the\\stest$', 'nothing'] } }
  const input = ['A', 'B', 'the test']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input array does not meet the criteria', async () => {
  const rule = { must_include: { regex: ['test', 'another'], message: 'failed array Test' } }
  const input = ['E', 'F']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
  expect(res.description).toBe('failed array Test')
})
