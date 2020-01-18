const beginsWith = require('../../../../../lib/validators/options_processor/options/begins_with')

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

test('return pass if input begins with the rule and matches is an array', () => {
  const match = ['feat', 'core']
  expectMatchToBe(match, 'feat: the test', 'pass')
  expectMatchToBe(match, 'core: the test', 'pass')
  expectMatchToBe(match, 'some title', 'fail')
})

test('return pass if input begins with the rule', () => {
  const match = 'the'
  expectMatchToBe(match, 'the test', 'pass')
  expectMatchToBe(match, ['A', 'B', 'the test'], 'pass')
})

test('return fail if input does not begins with the rule', async () => {
  const match = 'the'
  expectMatchToBe(match, 'test the', 'fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {begins_with: {regex: 'the'}}
  const input = 'the test'
  try {
    let config = beginsWith.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'match' is not provided for 'begins_with' option. Please check README for more information about configuration`)
  }
})

const expectMatchToBe = (match, input, result) => {
  let rule = {begins_with: { match: match }}
  const res = beginsWith.process(validatorContext, input, rule)
  expect(res.status).toBe(result)
}
