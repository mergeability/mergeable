const endsWith = require('../../../../lib/validators/options_processor/options/ends_with')

test('return pass if input meets the criteria', async () => {
  const rule = {ends_with: {match: 'test'}}
  let input = 'the test'
  let res = endsWith.process('label', input, rule)
  expect(res.status).toBe('pass')

  input = ['A', 'B', 'the test']
  res = endsWith.process('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {ends_with: {match: 'test'}}
  const input = 'test the'
  const res = endsWith.process('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {ends_with: {regex: 'test'}}
  const input = 'the test'
  const res = endsWith.process('label', input, rule)
  expect(res.status).toBe('error')
})