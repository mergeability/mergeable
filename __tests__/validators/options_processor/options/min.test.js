const min = require('../../../../lib/validators/options_processor/options/min')

test('return pass if input meets the criteria', async () => {
  const rule = {min: {count: 3}}
  let input = ['A', 'B', 'C']
  let res = min('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {min: {count: 3}}
  const input = ['A', 'B']
  const res = min('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {min: {regex: 3}}
  const input = ['the test']
  const res = min('label', input, rule)
  expect(res.status).toBe('error')
})