const MetaData = require('../../../lib/metaData')
const CheckReRun = require('../../../lib/interceptors/checkReRun')
const Helper = require('../../../__fixtures__/unit/helper')
require('object-dot').extend()

test('context is not modified if pre conditions are not met', async () => {
  let checkReRun = new CheckReRun()
  let context = Helper.mockContext()

  context.event = 'check_run'
  context.payload.action = 'created'
  Object.set(context, 'payload.check_run.output.text', mockOutput())
  context.github.pulls.get.mockReturnValue({ data: { number: 456 } })
  let newContext = await checkReRun.process(context)

  expect(newContext.event).toBe('check_run')

  context.payload.action = 'rerequested'

  newContext = await checkReRun.process(context)
  expect(newContext.event).toBe('check_run')

  context.payload.check_run.pull_requests = [{number: 1}]
  context.payload.check_run.id = 123

  newContext = await checkReRun.process(context)
  expect(newContext.event).toBe('pull_request')
})

test('#possibleInjection', () => {
  let checkReRun = new CheckReRun()

  expect(
    checkReRun.possibleInjection(Helper.mockContext(), {id: 1}, {id: 1})
  ).toBe(false)
  expect(
    checkReRun.possibleInjection(Helper.mockContext(), {id: 1}, {id: 2})
  ).toBe(true)
})

test('#process', async () => {
  let checkReRun = new CheckReRun()
  let context = Helper.mockContext()

  context.event = 'check_run'
  context.payload.action = 'rerequested'
  Object.set(context, 'payload.check_run.output.text', mockOutput())
  context.payload.check_run.pull_requests = [{number: 1}]
  context.payload.check_run.id = 123
  context.github.pulls.get.mockReturnValue({ data: { number: 456 } })
  let newContext = await checkReRun.process(context)

  expect(newContext.payload.pull_request.number).toBe(456)
  expect(newContext.event).toBe('pull_request')
  expect(newContext.payload.action).toBe('unlabeled')
})

const mockOutput = () => {
  return `
    #### :x: Validator: TITLE * :x:
      ***title must begins with "feat,test,chore"
      *** Input : use-case: title Settings : \`\`\`{"begins_with":{"match":["feat","test","chore"]}}\`\`\`
      ${MetaData.serialize({ id: 123, event: 'pull_request', action: 'unlabeled' })}
  `
}
