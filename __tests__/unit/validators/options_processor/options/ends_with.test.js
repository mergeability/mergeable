const endsWith = require('../../../../../lib/validators/options_processor/options/ends_with')

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

test('return pass if input ends with the rule and matches is an array', async () => {
  const match = ['end1', 'end2']

  expectMatchToBe(match, 'the test end1', 'pass')
  expectMatchToBe(match, 'the test end2', 'pass')
  expectMatchToBe(match, 'some title', 'fail')
})

test('return pass if input meets the criteria', async () => {
  const match = 'test'

  expectMatchToBe(match, 'the test', 'pass')
  expectMatchToBe(match, ['A', 'B', 'the test'], 'pass')
  expectMatchToBe(match, ['the test'], 'pass')
})

test('return fail if input does not meet the criteria', async () => {
  expectMatchToBe('test', 'test the', 'fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {ends_with: {regex: 'test'}}
  const input = 'the test'
  try {
    let config = endsWith.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'match' is not provided for 'ends_with' option. Please check README for more information about configuration`)
  }
})

const expectMatchToBe = (match, input, result) => {
  let rule = {ends_with: { match: match }}
  const res = endsWith.process(validatorContext, input, rule)
  expect(res.status).toBe(result)
}
