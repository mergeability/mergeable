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

    context.event = 'issues'
    context.github.pulls.get.mockReturnValue({ data: { number: 456 } })
    let newContext = await push.process(context)

    expect(newContext.event).toBe('issues')

    context.event = 'push'

    Object.set(context, 'payload.head_commit', mockOutput([], ['.github/mergeable.yml']))
    newContext = await push.process(context)
    expect(newContext.event).toBe('push')
  })

  test('call processWorkflow with modified context', async () => {
    let push = new Push()
    let context = mockContextWithConfig(CONFIG_STRING, ['PR1'])

    context.github.pulls.get.mockReturnValue({ data: { number: 456 } })
    context.event = 'push'

    Object.set(context, 'payload.head_commit', mockOutput([], ['.github/mergeable.yml']))
    let newContext = await push.process(context)
    expect(newContext.event).toBe('push')
    expect(processWorkflow.mock.calls.length).toBe(1)
    expect(processWorkflow.mock.calls[0][0].event).toBe('pull_request')
    expect(processWorkflow.mock.calls[0][0].payload.action).toBe('push_synchronize')
    expect(processWorkflow.mock.calls[0][0].payload.pull_request).toBe('PR1')
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
