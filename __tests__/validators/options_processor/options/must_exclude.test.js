const mustExclude = require('../../../../lib/validators/options_processor/options/must_exclude')

test('return pass if input meets the criteria', async () => {
  const rule = {must_exclude: {regex: 'test'}}
  let input = ['A', 'B', 'C']
  let res = mustExclude.process('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {must_exclude: {regex: 'test'}}
  const input = ['A', 'B', 'the test']
  const res = mustExclude.process('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {must_exclude: {count: 'test'}}
  const input = ['the test']
  const res = mustExclude.process('label', input, rule)
  expect(res.status).toBe('error')
})