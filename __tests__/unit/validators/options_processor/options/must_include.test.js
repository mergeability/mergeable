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
  const rule = {must_include: {regex: 'test'}}
  let input = ['A', 'B', 'the test']
  let res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {must_include: {regex: 'test', message: 'failed Test'}}
  const input = ['A', 'B']
  const res = mustInclude.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
  expect(res.description).toBe('failed Test')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {must_include: {count: 'test'}}
  const input = ['the test']
  try {
    let config = mustInclude.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'regex' is not provided for 'must_include' option. Please check README for more information about configuration`)
  }
})
