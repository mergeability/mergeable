jest.mock('jira-client')
let mockedJiraClient = require('jira-client')

const jira = require('../../../../../lib/validators/options_processor/options/jira')

const validatorContext = {
  name: 'headRef',
  supportedOptions: [
    'and',
    'or',
    'begins_with',
    'ends_with',
    'max',
    'min',
    'must_exclude',
    'must_include',
    'no_empty',
    'required',
    'jira']
}

test('Return false with wrong ticket with findIssue', async () => {
  mockedJiraClient.prototype.findIssue.mockImplementation(() => {
    throw new Error('test error message')
  })
  let res = await jira.checkTicketStatus('wrong-ticket-number')
  expect(mockedJiraClient).toHaveBeenCalled()
  expect(res).toBe(false)
})

test('return error if inputs are not in expected format', async () => {
  const rule = { jira: { } }
  const input = 'the test'
  try {
    let config = await jira.process(validatorContext, input, rule)
    expect(config).toBeUndefined()
  } catch (e) {
    expect(e.message).toBe(`Failed to run the test because 'regex' is not provided for 'jira' option. Please check README for more information about configuration`)
  }
})

test('return pass if input meets the criteria', async () => {
  // Mock valid JIRA Call
  const checkTicketStatus = jest.fn().mockReturnValue(true)
  jira.checkTicketStatus = checkTicketStatus

  const rule = { jira: { enabled: true, regex: 'test' } }
  let input = 'test-123123'
  let res = await jira.process(validatorContext, input, rule)
  expect(checkTicketStatus).toHaveBeenCalled()
  expect(res.status).toBe('pass')
})

test('return fail if input doesn\'t meet the regex criteria', async () => {
  // Mock wrong JIRA Call
  const checkTicketStatus = jest.fn().mockReturnValue(false)
  jira.checkTicketStatus = checkTicketStatus

  const rule = { jira: { enabled: true, regex: 'test' } }
  let input = 'feature-123123'
  let res = await jira.process(validatorContext, input, rule)
  expect(checkTicketStatus).toHaveBeenCalledTimes(0)
  expect(res.status).toBe('fail')
})

test('return fail if JIRA Ticket ID couldn\'t be found', async () => {
  // Mock wrong JIRA Call
  const checkTicketStatus = jest.fn().mockReturnValue(false)
  jira.checkTicketStatus = checkTicketStatus

  const rule = { jira: { enabled: true, regex: 'test' } }
  let input = 'test-123123'
  let res = await jira.process(validatorContext, input, rule)
  expect(checkTicketStatus).toHaveBeenCalled()
  expect(res.status).toBe('fail')
})

test('return fail if JIRA Ticket ID couldn\'t be found', async () => {
  // Mock wrong JIRA Call
  const checkTicketStatus = jest.fn().mockReturnValue(false)
  jira.checkTicketStatus = checkTicketStatus

  const rule = { jira: { enabled: true, regex: 'test' } }
  let input = 'test-123123'
  let res = await jira.process(validatorContext, input, rule)
  expect(checkTicketStatus).toHaveBeenCalled()
  expect(res.status).toBe('fail')
})
