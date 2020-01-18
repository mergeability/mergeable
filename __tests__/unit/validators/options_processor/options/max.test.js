const max = require('../../../../../lib/validators/options_processor/options/max')

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

describe('max option applied to arrays', () => {
  test('return pass if input meets the criteria', async () => {
    const rule = {max: {count: 3}}
    let input = ['A', 'B']
    let res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('pass')
  })

  test('return pass if input exactly meets the criteria', async () => {
    const rule = {max: {count: 3}}
    let input = ['A', 'B', 'C']
    let res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('pass')
  })

  test('return fail if input does not meet the criteria', async () => {
    const rule = {max: {count: 3}}
    const input = ['A', 'B', 'C', 'D']
    const res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('fail')
  })
})

describe('max option applied to integers', () => {
  test('return pass if input meets the criteria', async () => {
    const rule = {max: {count: 20}}
    let input = 10
    let res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('pass')
  })

  test('return pass if input exactly meets criteria', async () => {
    const rule = {max: {count: 10}}
    const input = 10
    const res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('pass')
  })

  test('return fail if input does not meet the criteria', async () => {
    const rule = {max: {count: 10}}
    const input = 20
    const res = max.process(validatorContext, input, rule)
    expect(res.status).toBe('fail')
  })
})

describe('max option configured incorrectly', () => {
  test('return error if rule config is not in expected format', async () => {
    const rule = {max: {regex: 3}}
    const input = ['the test']
    try {
      let config = max.process(validatorContext, input, rule)
      expect(config).toBeUndefined()
    } catch (e) {
      expect(e.message).toBe(`Failed to run the test because 'count' is not provided for 'max' option. Please check README for more information about configuration`)
    }
  })

  test('return error if input is not supported type', async () => {
    const rule = {max: {count: 3}}
    const input = 'hello'
    try {
      let config = max.process(validatorContext, input, rule)
      expect(config).toBeUndefined()
    } catch (e) {
      expect(e.message).toBe('Input type invalid, expected Array or Integer as input')
    }
  })
})
