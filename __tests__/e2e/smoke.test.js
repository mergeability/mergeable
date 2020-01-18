const nock = require('nock')
// Requiring our app implementation
const mergeable = require('../..')
const { createProbot } = require('probot')

// Requiring our fixtures
const prEditedPayload = require('./__fixtures__/pr.edited.payload.json')
const configResponse = require('./__fixtures__/config.response.json')
const listFilesResponse = require('./__fixtures__/pr.listFile.response.json')
const createCheckResponse = require('./__fixtures__/check.create.response.json')
const updateCheckResponse = require('./__fixtures__/check.update.response.json')

const configString = `
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
    assignee:
      and:
        - max:
            count: 4
        - min:
            count: 1
      or:
        - max:
            count: 4
        - min:
            count: 1
      required:
        reviewers: ['shine2lay', 'shinelay']
      max:
        count: 4
      min:
        count: 1
      no_empty:
        enabled: true
      `

describe('smoke tests', () => {
  let probot

  beforeEach(() => {
    nock.disableNetConnect()
    probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
    probot.load(mergeable)
  })

  test('that mergeable run properly for an PR', async () => {
    let updateCheckRequestBody = null
    let createCheckRequestBody = null

    const expectedCreateCheckBody = { status: 'in_progress',
      output:
      { title: 'Mergeable is running.',
        summary:
            'Please be patient. We\'ll get you the results as soon as possible.' },
      name: 'Mergeable',
      head_branch: 'test3',
      head_sha: '9c66d957e026260fb6725c54b631991a54028672' }

    const expectedUpdateCheckBody = { name: 'Mergeable',
      status: 'completed',
      output:
      { title: 'Mergeable run returned Status ***FAIL***',
        summary:
            '### Status: FAIL\n\n        Here are some stats of the run:\n        2 validations were ran.\n        0 PASSED\n        2 FAILED\n      ',
        text:
            '#### :x: Validator: TITLE\n * :x: ***(title must begins with "begins_with_text"  ***AND***  title must end with "ends_with_text")***\n       Input : [WIP] Test3\n       Settings : ```{"and":[{"begins_with":{"match":"begins_with_text"}},{"ends_with":{"match":"ends_with_text"}}]}```\n * :x: ***(title does not include "must_be_included_text"  ***OR***  title must begins with "begins_with_text")***\n       Input : [WIP] Test3\n       Settings : ```{"or":[{"must_include":{"regex":"must_be_included_text"}},{"begins_with":{"match":"begins_with_text"}}]}```\n * :heavy_check_mark: ***title must exclude \'must_be_excluded_text\'***\n       Input : [WIP] Test3\n       Settings : ```{"must_exclude":{"regex":"must_be_excluded_text"}}```\n * :x: ***title does not include "must_be_included_text"***\n       Input : [WIP] Test3\n       Settings : ```{"must_include":{"regex":"must_be_included_text"}}```\n * :x: ***title must begins with "begins_with_text"***\n       Input : [WIP] Test3\n       Settings : ```{"begins_with":{"match":"begins_with_text"}}```\n * :x: ***title must end with "ends_with_text"***\n       Input : [WIP] Test3\n       Settings : ```{"ends_with":{"match":"ends_with_text"}}```\n#### :x: Validator: ASSIGNEE\n * :heavy_check_mark: ***All the requisite validations passed for \'and\' option***\n       Input : shine2lay,shineTest\n       Settings : ```{"and":[{"max":{"count":4}},{"min":{"count":1}}]}```\n * :heavy_check_mark: ***All the requisite validations passed for \'or\' option***\n       Input : shine2lay,shineTest\n       Settings : ```{"or":[{"max":{"count":4}},{"min":{"count":1}}]}```\n * :x: ***assignee: shinelay required***\n       Input : shine2lay,shineTest\n       Settings : ```{"required":{"reviewers":["shine2lay","shinelay"]}}```\n * :heavy_check_mark: ***assignee does have a maximum of \'4\'***\n       Input : shine2lay,shineTest\n       Settings : ```{"max":{"count":4}}```\n * :heavy_check_mark: ***assignee does have a minimum of \'1\'***\n       Input : shine2lay,shineTest\n       Settings : ```{"min":{"count":1}}```\n * :heavy_check_mark: ***The assignee is not empty***\n       Input : shine2lay,shineTest\n       Settings : ```{"no_empty":{"enabled":true}}```\n<!-- #mergeable-data {"id":4,"event":"pull_request","action":"edited"} #mergeable-data -->' },
      conclusion: 'failure'
    }

    const updateCheckCall = nock('https://api.github.com')
      .patch('/repos/shine2lay/MergeableTest/check-runs/4', (body) => {
        updateCheckRequestBody = body
        return true
      })
      .reply(200, updateCheckResponse)

    const createCheckCall = nock('https://api.github.com')
      .post('/repos/shine2lay/MergeableTest/check-runs', (body) => {
        createCheckRequestBody = body
        return true
      })
      .reply(200, createCheckResponse)

    const listFilesCall = nock('https://api.github.com')
      .get('/repos/shine2lay/MergeableTest/pulls/49/files')
      .reply(200, listFilesResponse)

    configResponse.content = Buffer.from(configString).toString('base64')
    const fetchConfigCall = nock('https://api.github.com')
      .get('/repos/shine2lay/MergeableTest/contents/.github/mergeable.yml')
      .reply(200, configResponse)

    // Receive a webhook event
    await probot.receive({ name: 'pull_request', payload: prEditedPayload })

    // check that all api were called
    expect(updateCheckCall.isDone()).toBe(true)
    expect(createCheckCall.isDone()).toBe(true)
    expect(listFilesCall.isDone()).toBe(true)
    expect(fetchConfigCall.isDone()).toBe(true)

    // check that api calls were made with expect request body
    expect(createCheckRequestBody).toEqual(expect.objectContaining(expectedCreateCheckBody))
    expect(updateCheckRequestBody).toEqual(expect.objectContaining(expectedUpdateCheckBody))
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
