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
  const rule = {must_exclude: {regex: 'test'}}
  let input = ['A', 'B', 'C']
  let res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {must_exclude: {regex: 'test'}}
  const input = ['A', 'B', 'the test']
  const res = mustExclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {must_exclude: {count: 'test'}}
  const input = ['the test']
  try {
    let config = mustExclude.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'regex' is not provided for 'must_exclude' option. Please check README for more information about configuration`)
  }
})
