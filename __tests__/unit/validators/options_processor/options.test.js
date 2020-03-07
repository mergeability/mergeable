const options = require('../../../../lib/validators/options_processor/options')

test('return correct output if all inputs are valid', async () => {
  let rule = {do: 'label', must_include: {regex: 'A'}}
  let input = ['A', 'C']
  let res = options.process('label', input, rule)
  expect(res.status).toBe('pass')

  rule = [{do: 'label', must_include: {regex: 'A'}}, {do: 'label', must_exclude: {regex: 'B'}}]
  input = ['A', 'C']
  res = options.process('label', input, rule)
  expect(res.status).toBe('pass')
})

test('return error if unsupported options are provided', async () => {
  const rule = {do: 'label', must_be_include: {regex: 'A'}}
  const input = ['A']
  const res = options.process('label', input, rule)
  expect(res.status).toBe('error')
  expect(res.validations[0].description).toBe(`Cannot find module './options/must_be_include' from 'options.js'`)
})

test('return raw output if returnRawOutput is set to true', async () => {
  const rule = {do: 'label', must_include: {regex: 'A'}}
  const input = 'A'
  const res = options.process('label', input, rule, true)
  expect(Array.isArray(res)).toBe(true)
})
