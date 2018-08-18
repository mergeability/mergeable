const required = require('../../../../lib/validators/options_processor/options/required')

test('return pass if input meets the criteria', async () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  let input = ['shine2lay', 'jusx']
  let res = required.process('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  const input = ['jusx']
  const res = required.process('label', input, rule)
  expect(res.status).toBe('fail')
})

test('return error if inputs are not in expected format', async () => {
  const rule = {required: {count: 'test'}}
  const input = ['jusx']
  const res = required.process('label', input, rule)
  expect(res.status).toBe('error')
})
