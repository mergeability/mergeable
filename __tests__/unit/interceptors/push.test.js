const Push = require('../../../lib/interceptors/push')
const Helper = require('../../../__fixtures__/unit/helper')
const yaml = require('js-yaml')
const processWorkflow = require('../../../lib/flex/lib/processWorkflow')
require('object-dot').extend()

jest.mock('../../../lib/configuration/configuration', () => ({
  instanceWithContext: jest.fn().mockReturnValue({hasErrors: jest.fn()})
}))

jest.mock('../../../lib/flex/lib/processWorkflow')

const CONFIG_STRING = `
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
describe('push interceptor test', () => {
  beforeEach(() => {
    processWorkflow.mockClear()
  })

  test('context is not modified if pre conditions are not met', async () => {
    let push = new Push()
    let context = mockContextWithConfig(CONFIG_STRING, ['PR1'])

    context.eventName = 'issues'
    context.octokit.pulls.get.mockReturnValue({ data: { number: 456 } })
    let newContext = await push.process(context)

    expect(newContext.eventName).toBe('issues')

    context.eventName = 'push'

    Object.set(context, 'payload.head_commit', mockOutput([], ['.github/mergeable.yml']))
    newContext = await push.process(context)
    expect(newContext.eventName).toBe('push')
  })

  test('call processWorkflow with modified context', async () => {
    let push = new Push()
    let context = mockContextWithConfig(CONFIG_STRING, ['PR1'])

    context.octokit.pulls.get.mockReturnValue({ data: { number: 456 } })
    context.eventName = 'push'

    Object.set(context, 'payload.head_commit', mockOutput([], ['.github/mergeable.yml']))
    let newContext = await push.process(context)
    expect(newContext.eventName).toBe('push')
    expect(processWorkflow.mock.calls.length).toBe(1)
    expect(processWorkflow.mock.calls[0][0].eventName).toBe('pull_request')
    expect(processWorkflow.mock.calls[0][0].payload.action).toBe('push_synchronize')
    expect(processWorkflow.mock.calls[0][0].payload.pull_request).toBe('PR1')
  })

  test('do nothing if `head_commit` property is null', async () => {
    let push = new Push()
    let context = mockContextWithConfig(CONFIG_STRING, ['PR1'])

    context.octokit.pulls.get.mockReturnValue({ data: { number: 456 } })
    context.eventName = 'push'
    context.payload.head_commit = null

    let newContext = await push.process(context)
    expect(newContext.eventName).toBe('push')
    expect(processWorkflow.mock.calls.length).toBe(0)
  })
})

const mockContextWithConfig = (config, list) => {
  const context = Helper.mockContext({prList: list})
  context.probotContext = {
    config: jest.fn().mockResolvedValue(yaml.safeLoad(config))
  }

  return context
}

const mockOutput = (addedFiles, modifiedFiles) => {
  return {
    added: addedFiles,
    modified: modifiedFiles
  }
}
