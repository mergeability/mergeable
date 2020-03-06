const Helper = require('../../../../__fixtures__/unit/helper')
const assignees = require('../../../../lib/validators/options_processor/assignees')

test('that assignees are correctly retrieved', async () => {
  let res = await assignees.process(createMockPR(), Helper.mockContext())
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

const createMockPR = () => {
  return Helper.mockContext({
    user: {
      login: 'creator'
    },
    number: 1,
    assignees: [{login: 'bob'}]
  }).payload.pull_request
}
