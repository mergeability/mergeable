const required = require('../../../../lib/validators/options_processor/options/required')

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
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  let input = ['shine2lay', 'jusx']
  let res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  const input = ['jusx']
  const res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {required: {count: 'test'}}
  const input = ['jusx']
  try {
    let config = required.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'reviewers' is not provided for 'required' option. Please check README for more information about configuration`)
  }
})
