const V2Config = require('../../../../lib/configuration/transformers/v2Config')
const constants = require('../../../../lib/configuration/lib/consts')
const yaml = require('js-yaml')

test('pass, fail, error defaults will load when pull_request event is specified.', () => {
  let config = `
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  let transformed = V2Config.transform(yaml.safeLoad(config))

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
  let config = `
  version: 2
  mergeable:
    - when: issues.*, pull_request.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  let transformed = V2Config.transform(yaml.safeLoad(config))
  console.log(transformed)
  expect(transformed.mergeable[0].pass).toEqual(constants.DEFAULT_PR_PASS)
  expect(transformed.mergeable[0].fail).toEqual(constants.DEFAULT_PR_FAIL)
  expect(transformed.mergeable[0].error).toEqual(constants.DEFAULT_PR_ERROR)
})

test('only pass, fail defaults ignore recipes that are not for pull_requests', () => {
  let config = `
  version: 2
  mergeable:
    - when: issues.*
      validate:
        - do: title
          must_exclude:
            regex: 'wip|work in progress'
            message: 'This PR is work in progress.'
  `
  let transformed = V2Config.transform(yaml.safeLoad(config))

  expect(transformed.mergeable[0].pass).toEqual([])
  expect(transformed.mergeable[0].fail).toEqual([])
  expect(transformed.mergeable[0].error).toEqual([])
})
