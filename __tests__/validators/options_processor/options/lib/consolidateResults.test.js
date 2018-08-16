const consolidateResult = require('../../../../../lib/validators/options_processor/options/lib/consolidateResults')

test('returns pass status if no fail or error status exists', async () => {
  const validateResults = [{status: 'pass'}]
  const res = consolidateResult(validateResults)
  expect(res.status).toBe('pass')
})

test('returns fail status if fail status exists but no error status exists', async () => {
  const validateResults = [{status: 'pass'}, {status: 'fail'}]
  const res = consolidateResult(validateResults)
  expect(res.status).toBe('fail')
})

test('returns error status if error status exists', async () => {
  const validateResults = [{status: 'pass'}, {status: 'fail'}, {status: 'error'}]
  const res = consolidateResult(validateResults)
  expect(res.status).toBe('error')
})
