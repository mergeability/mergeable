const mustInclude = require('../../../../lib/validators/options_processor/options/must_include')

test('return pass if input meets the criteria', async () => {
  const rule = {must_include: {regex: 'test'}}
  let input = ['A', 'B', 'the test']
  let res = mustInclude('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {must_include: {regex: 'test'}}
  const input = ['A', 'B']
  const res = mustInclude('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {must_include: {count: 'test'}}
  const input = ['the test']
  const res = mustInclude('label', input, rule)
  expect(res.status).toBe('error')
})