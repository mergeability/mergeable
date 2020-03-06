const nock = require('nock')
const fs = require('fs')

const checkUpdateResponse = require('./check.update.response.json')
const checkCreateResponse = require('./check.create.response.json')
const configResponse = require('./config.response.json')
const prListFilesResponse = require('./pr.listFile.response.json')
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
    configResponse.content = Buffer.from(configString).toString('base64')
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/contents/.github/mergeable.yml`
    return nock('https://api.github.com')
      .get(path)
      .reply(200, configResponse)
  }

  mockPRListFileCall (options = {}) {
    const response = options.response ? options.response : prListFilesResponse
    const path = `/repos/${this.repo.owner.login}/${this.repo.name}/pulls/${this.payload.number}/files`
    return nock('https://api.github.com')
      .get(path)
      .reply(200, response)
  }
}

module.exports = MockHelper
