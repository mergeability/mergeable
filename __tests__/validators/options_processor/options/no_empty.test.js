const noEmpty = require('../../../../lib/validators/options_processor/options/no_empty')

test('return pass if input meets the criteria', async () => {
  const rule = {no_empty: {enabled: true}}
  let input = 'NOT EMPTY'
  let res = noEmpty.process('label', input, rule)
  expect(res.status).toBe('pass')

  input = ['']
  res = noEmpty.process('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {no_empty: {enabled: true}}
  let input = ''
  let res = noEmpty.process('label', input, rule)
  expect(res.status).toBe('fail')

  input = []
  res = noEmpty.process('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {no_empty: {regex: true}}
  const input = 'the test'
  const res = noEmpty.process('label', input, rule)
  expect(res.status).toBe('error')
})