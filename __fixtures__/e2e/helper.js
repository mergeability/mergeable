const nock = require('nock')
const fs = require('fs')

const checkUpdateResponse = require('./check.update.response.json')
const checkCreateResponse = require('./check.create.response.json')
const prListFilesResponse = require('./pr.listFile.response.json')
const issueCommentResponse = require('./issue.listComment.response.json')
const defaultConfig = fs.readFileSync('./__fixtures__/e2e/config.v1.default.yml', 'utf8')

class MockHelper {
  constructor (settings) {
    this.payload = settings.payload
    this.repo = settings.payload.repository
  }

  mockCheckUpdateCall (options = {}) {
    const response = options.response ? options.response : checkUpdateResponse
    const checkRunId = options.checkRunId ? options.checkRunId : '4'
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/check-runs/${checkRunId}`

    return nock('https://api.github.com')
      .patch(path, (body) => {
        options.requestBody = body
        return true
      })
      .reply(200, response)
  }

  mockCheckCreateCall (options = {}) {
    const response = options.response ? options.response : checkCreateResponse
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/check-runs`

    return nock('https://api.github.com')
      .post(path, (body) => {
        options.requestBody = body
        return true
      })
      .reply(200, response)
  }

  mockFetchConfigCall (options = {}) {
    const configString = options.config ? options.config : defaultConfig
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/contents/.github%2Fmergeable.yml`
    return nock('https://api.github.com')
      .get(path)
      .reply(200, configString)
  }

  mockPRListFileCall (options = {}) {
    const response = options.response ? options.response : prListFilesResponse
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/pulls/${this.payload.number}/files`
    return nock('https://api.github.com')
      .get(path)
      .reply(200, response)
  }

  mockIssueListCommentsCall (options = {}) {
    const response = options.response ? options.response : issueCommentResponse
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/issues/${this.payload.number}/comments`
    return nock('https://api.github.com')
      .get(path)
      .reply(200, response)
  }
  mockListInstallation (options = {}) {
    nock('https://api.github.com')
      .get('/app/installations?per_page=100')
      .reply(200, [{ account: { login: 'testUser' } }])
  }
  mockListReposAccessibleToInstallation (options = {}) {
    nock('https://api.github.com')
      .get('/installation/repositories?per_page=100')
      .reply(200, [{ id: 2 }])
  }
}

module.exports = MockHelper
