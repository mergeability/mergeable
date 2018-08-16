const beginsWith = require('../../../../lib/validators/options_processor/options/begins_with')

test('return pass if input begins with the rule', async () => {
  const rule = {begins_with: {match: 'the'}}
  let input = 'the test'
  let res = beginsWith('label', input, rule)
  expect(res.status).toBe('pass')

  input = ['A', 'B', 'the test']
  res = beginsWith('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not begins with the rule', async () => {
  const rule = {begins_with: {match: 'the'}}
  const input = 'test the'
  const res = beginsWith('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {begins_with: {regex: 'the'}}
  const input = 'the test'
  const res = beginsWith('label', input, rule)
  expect(res.status).toBe('error')
})