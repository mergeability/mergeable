const noEmpty = require('../../../../../lib/validators/options_processor/options/no_empty')

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

const verify = (enabled, input, inputArr, result) => {
  const rule = { no_empty: { enabled: enabled } }
  let res = noEmpty.process(validatorContext, input, rule)
  expect(res.status).toBe(result)

  res = noEmpty.process(validatorContext, inputArr, rule)
  expect(res.status).toBe(result)
}

test('return pass if input meets the criteria', () => {
  verify(true, 'NOT EMPTY', [''], 'pass')
  verify(false, 'NOT EMPTY', [''], 'pass')
})

test('return fail if input does not meet the criteria', () => {
  verify(true, '', [], 'fail')
  verify(true, null, [], 'fail')
  verify(true, undefined, [], 'fail')
  verify(false, '', [''], 'pass')
})

test('return error if input does not meet the criteria', () => {
  const rule = { no_empty: { enabled: true } }
  let input = 1
  try {
    const config = noEmpty.process(validatorContext, input, rule)
    expect(config).toBeDefined()
  } catch (e) {
    expect(e.message).toBe('Input type invalid, expected string or Array as input')
  }

  input = [1]
  try {
    const config = noEmpty.process(validatorContext, input, rule)
    expect(config).toBeDefined()
  } catch (e) {
    expect(e.message).toBe('Input type invalid, expected string or Array as input')
  }
})

test('return error if inputs are not in expected format', async () => {
  const rule = { no_empty: { regex: true } }
  const input = 'the test'
  try {
    const config = noEmpty.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Failed to run the test because \'enabled\' is not provided for \'no_empty\' option. Please check README for more information about configuration')
  }
})
