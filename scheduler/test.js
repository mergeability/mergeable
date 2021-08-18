process.env.PRIVATE_KEY = 'testkey'

const nock = require('nock')
const createScheduler = require('./')
const { Probot, ProbotOctokit } = require('probot')

const payload = require('./fixtures/installation-created.json')

nock.disableNetConnect()

describe('Schedules intervals for a repository', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({
      githubToken: 'test',
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false }
      })
    })
    createScheduler(probot)
  })

  it('gets a page of repositories', async (done) => {
    nock('https://api.github.com')
      .get('/app/installations')
      .query({ per_page: 1 })
      .reply(200, [{ id: 1 }], {
        Link: '<https://api.github.com.com/app/installations?page=2&per_page=1>; rel="next"',
        'X-GitHub-Media-Type': 'github.v3; format=json'
      })
      .get('/installation/repositories')
      .query({ page: 2, per_page: 1 })
      .reply(200, [{ id: 2 }])
      .persist()

    nock('https://api.github.com')
      .get('/app/installations?per_page=100')
      .reply(200, [{ account: { login: 'testUser' } }])

    nock('https://api.github.com')
      .get('/installation/repositories?per_page=100')
      .reply(200, [{ id: 2 }])

    await probot.receive({ name: 'installation', payload })
    await done()
  })
})
