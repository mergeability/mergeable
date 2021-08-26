const BooleanMatch = require('../../../../../lib/validators/options_processor/options/boolean')

const validatorContext = {
  name: 'payload',
  supportedOptions: [
    'boolean',
    'must_exclude',
    'must_include']
}

const verify = (match, input, result) => {
  const rule = { boolean: { match } }
  const res = BooleanMatch.process(validatorContext, input, rule)
  expect(res.status).toBe(result)
  return res
}

test('return pass if input is a string that meets the criteria', () => {
  verify(true, 'true', 'pass')
  verify(false, 'false', 'pass')
})

test('return pass if input is a boolean that meets the criteria', () => {
  verify(true, true, 'pass')
  verify(false, false, 'pass')
})

test('return fail if input does not meet the criteria', () => {
  verify(true, false, 'fail')
  verify(false, 'true', 'fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = { boolean: { match: true } }
  const input = ['true']
  try {
    const config = BooleanMatch.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe('Input type invalid, expected strings "true" or "false", or boolean literal `true` or `false` as input')
  }
})
