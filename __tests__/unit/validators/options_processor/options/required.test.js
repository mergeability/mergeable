const required = require('../../../../../lib/validators/options_processor/options/required')

const validatorContext = { name: 'ValidatorName' }

test('return pass if input meets the criteria', async () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  let input = ['shine2lay', 'jusx']
  let res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('return fail if input does not meet the criteria', async () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusx']}}
  const input = ['jusx']
  const res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('return pass when reviewers list not provided', () => {
  const rule = {required: {owners: true}}
  const input = ['jusx']
  const res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('pass')
})

test('case sensitivity', () => {
  const rule = {required: {reviewers: ['shine2lay', 'jusxtest']}}
  const input = ['jusxTest']
  const res = required.process(validatorContext, input, rule)
  expect(res.status).toBe('fail')
})

test('case sensitivity with correct case insensitivity.', () => {
  const rule = {required: {reviewers: ['camelCaseUser', 'jusxtest']}}
  const input = ['jusxTest']
  const res = required.process(validatorContext, input, rule)
  expect(res.description).toBe('ValidatorName: camelCaseUser required')
})
