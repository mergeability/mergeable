const nock = require('nock')
// Requiring our app implementation
const mergeable = require('../..')
const { Probot, ProbotOctokit } = require('probot')
const express = require('express')

const MockHelper = require('../../__fixtures__/e2e/helper')

// Requiring our PR payloads
const prPayload = require('../../__fixtures__/e2e/pr.payload.json')

describe('smoke tests', () => {
  let probot

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({
      githubToken: 'test',
      // Disable thrttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false }
      })
    })
    mergeable(probot, { getRouter: () => { return express() } })
  })

  test('that mergeable run properly for an PR', async () => {
    const config = `
mergeable:
  pull_requests:
    title:
      and:
        - begins_with:
            match: 'begins_with_text'
        - ends_with:
            match: 'ends_with_text'
      or:
        - must_include:
            regex: 'must_be_included_text'
        - begins_with:
            match: 'begins_with_text'
      must_exclude:
        regex: 'must_be_excluded_text'
      must_include:
        regex: 'must_be_included_text'
      begins_with:
        match: 'begins_with_text'
      ends_with:
        match: 'ends_with_text'
      `

    const createCheckOptions = {
      expectedBody: {
        status: 'in_progress',
        output:
      {
        title: 'Mergeable is running.',
        summary:
            'Please be patient. We\'ll get you the results as soon as possible.'
      },
        name: 'Mergeable',
        head_branch: 'test3',
        head_sha: '9c66d957e026260fb6725c54b631991a54028672'
      }
    }
    const updateCheckOptions = {
      expectedBody: {
        name: 'Mergeable',
        status: 'completed',
        output:
      {
        title: '1/1 Fail(s):  TITLE',
        summary:
            '### Status: FAIL\n\n        Here are some stats of the run:\n        1 validations were run.\n        0 PASSED\n        1 FAILED\n      ',
        text:
          '#### :x: Validator: TITLE\n * :heavy_check_mark: ***title must exclude \'must_be_excluded_text\'***\n       Input : [WIP] Test3\n       Settings : ```{"must_exclude":{"regex":"must_be_excluded_text"}}```\n * :x: ***title does not include "must_be_included_text"***\n       Input : [WIP] Test3\n       Settings : ```{"must_include":{"regex":"must_be_included_text"}}```\n * :x: ***title must begins with "begins_with_text"***\n       Input : [WIP] Test3\n       Settings : ```{"begins_with":{"match":"begins_with_text"}}```\n * :x: ***title must end with "ends_with_text"***\n       Input : [WIP] Test3\n       Settings : ```{"ends_with":{"match":"ends_with_text"}}```\n * :x: ***(title must begins with "begins_with_text"  ***AND***  title must end with "ends_with_text")***\n       Input : [WIP] Test3\n       Settings : ```{"and":[{"begins_with":{"match":"begins_with_text"}},{"ends_with":{"match":"ends_with_text"}}]}```\n * :x: ***(title does not include "must_be_included_text"  ***OR***  title must begins with "begins_with_text")***\n       Input : [WIP] Test3\n       Settings : ```{"or":[{"must_include":{"regex":"must_be_included_text"}},{"begins_with":{"match":"begins_with_text"}}]}```\n<!-- #mergeable-data {"id":4,"eventName":"pull_request","action":"edited"} #mergeable-data -->'
      },
        conclusion: 'failure'
      }
    }
    const settings = `
version: 1
mergeable:
  use_config_from_pull_request: true
  use_config_cache: false
  use_org_as_default_config: false
`
    const Helper = new MockHelper({ payload: prPayload })
    Helper.mockListReposAccessibleToInstallation()
    Helper.mockListInstallation()
    const updateCheckCall = Helper.mockCheckUpdateCall(updateCheckOptions)
    const createCheckCall = Helper.mockCheckCreateCall(createCheckOptions)
    const listFilesCall = Helper.mockPRListFileCall()
    const listCommentsCall = Helper.mockIssueListCommentsCall()
    const fetchConfigCall = Helper.mockFetchConfigCall({ config })
    const fetchSettingsCall = Helper.mockFetchSettingsCall({ settings })

    // Receive a webhook event
    await probot.receive({ name: 'pull_request', payload: prPayload })

    // check that all api were called
    expect(updateCheckCall.isDone()).toBe(true)
    expect(createCheckCall.isDone()).toBe(true)
    expect(listFilesCall.isDone()).toBe(true)
    expect(listCommentsCall.isDone()).toBe(true)
    expect(fetchConfigCall.isDone()).toBe(true)
    expect(fetchSettingsCall.isDone()).toBe(true)

    // check that api calls were made with expect request body
    expect(createCheckOptions.requestBody).toEqual(expect.objectContaining(createCheckOptions.expectedBody))
    expect(updateCheckOptions.requestBody).toEqual(expect.objectContaining(updateCheckOptions.expectedBody))
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
