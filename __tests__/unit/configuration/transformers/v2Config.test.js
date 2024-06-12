const V2Config = require('../../../../lib/configuration/transformers/v2Config')
const constants = require('../../../../lib/configuration/lib/consts')
const yaml = require('js-yaml')

test('pass, fail, error defaults will load when pull_request event is specified.', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})

test('pass, fail, error defaults will load when pull_request event is specified and user specified configs are not overridden.', () => {
  let config = `
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
      pass:
        - do: checks
          state: completed
          status: success
          payload:
            title: a title
            summary: a summary
            text: some text
    `

  let transformed = V2Config.transform(yaml.safeLoad(config))
  expect(transformed.mergeable[0].pass[0].payload.title).toBe('a title')
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)

  config = `
  ${config}
      fail:
        - do: checks
          state: completed
          status: failure
          payload:
            title: a failed title
  `
  transformed = V2Config.transform(yaml.safeLoad(config))
  expect(transformed.mergeable[0].pass[0].payload.title).toBe('a title')
  expect(transformed.mergeable[0].fail[0].payload.title).toBe('a failed title')
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)

  config = `
  ${config}
      error:
        - do: checks
          state: completed
          status: error
          payload:
            title: an errored title
  `
  transformed = V2Config.transform(yaml.safeLoad(config))
  expect(transformed.mergeable[0].pass[0].payload.title).toBe('a title')
  expect(transformed.mergeable[0].fail[0].payload.title).toBe('a failed title')
  expect(transformed.mergeable[0].error[0].payload.title).toBe('an errored title')
})

test('pass, fail, error defaults will load when pull_request is mixed with other events.', () => {
  const config = `
  version: 2
  mergeable:
    - when: issues.*, pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})

test('pass, fail, error defaults will load when issue_comment event is specified.', () => {
  const config = `
  version: 2
  mergeable:
    - when: issue_comment.*
      validate:
        - do: lastComment
          must_exclude:
            regex: 'wip|work in progress'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})

test('pass, fail, error defaults will load when pull_request_review event is specified.', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_request_review.*
      validate:
        - do: payload
          review:
            state:
              must_exclude:
                regex: 'changes_requested'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})

test('only pass, fail defaults ignore recipes that are not for pull_requests', () => {
  const config = `
  version: 2
  mergeable:
    - when: issues.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual([])
  expect(transformed.mergeable[0].fail).toEqual([])
  expect(transformed.mergeable[0].error).toEqual([])
})

test('default checks fill in missing required fields', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_requests.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
      pass:
        - do: checks
          payload:
            summary: 'test Summary'
            text: 'test text'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual([{
    do: 'checks',
    status: 'success',
    payload: {
      title: 'Mergeable Run has been Completed!',
      summary: 'test Summary',
      text: 'test text'
    }
  }])
})

test('adding default only works for checks', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_requests.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
      fail:
        - do: comment
          payload:
            body: 'test Body'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].fail).toEqual([{
    do: 'comment',
    payload: {
      body: 'test Body'
    }
  }])
})

test('defaults are not added to all cases if no checks exists', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_requests.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
      fail:
        - do: comment
          payload:
            body: 'test Body'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual([])
  expect(transformed.mergeable[0].error).toEqual([])
})

test('defaults are not added to all cases if at least one checks exists', () => {
  const config = `
  version: 2
  mergeable:
    - when: pull_requests.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
      fail:
        - do: checks
          payload:
            body: 'test Body'
  `
  const transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail[0].payload.body).toEqual('test Body')
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})
