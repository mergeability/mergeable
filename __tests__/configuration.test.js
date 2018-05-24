const Configuration = require('../lib/configuration')

test('that Configuration validates root node in yml', () => {
  try {
    let config = new Configuration('nothing:')
    console.log(config)
  } catch (e) {
    expect(e.message).toBe(Configuration.ERROR_INVALID_YML)
  }
})

// write test to test for bad yml

test('that constructor loads settings correctly', () => {
  let config = new Configuration(`
    mergeable:
      pull_requests:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
  `)

  let pullRequest = config.settings.mergeable.pull_requests
  expect(pullRequest.approvals).toBe(5)
  expect(pullRequest.title).toBe('title regex')
  expect(pullRequest.label).toBe('label regex')
})

test('that defaults load correctly when mergeable is null', () => {
  let config = new Configuration(`mergeable:`)
  let pullRequests = config.settings.mergeable.pull_requests

  expect(pullRequests.approvals).toBe(Configuration.DEFAULTS.approvals)
  expect(pullRequests.title).toBe(Configuration.DEFAULTS.title)
  expect(pullRequests.label).toBe(Configuration.DEFAULTS.label)
  expect(pullRequests.exclude).toBe(undefined)
})

test('that defaults load correctly when mergeable has partial properties defined', () => {
  let config = new Configuration(`
    mergeable:
      pull_requests:
        approvals: 1
    `)

  let pullRequest = config.settings.mergeable.pull_requests
  expect(pullRequest.approvals).toBe(1)
  expect(pullRequest.title).toBe(Configuration.DEFAULTS.title)
  expect(pullRequest.label).toBe(Configuration.DEFAULTS.label)
})

test('that instanceWithContext returns the right Configuration', async () => {
  let context = {
    repo: jest.fn().mockReturnValue({
      repo: '',
      owner: ''
    }),
    payload: {
      pull_request: {
        number: 1
      }
    },
    github: {
      repos: {
        getContent: jest.fn().mockReturnValue(
          Promise.resolve({ data: { content: Buffer.from(`
            mergeable:
              pull_requests:
                approvals: 5
                label: 'label regex'
                title: 'title regex'
          `).toString('base64') }})
        )
      }
    }
  }

  Configuration.instanceWithContext(context).then(config => {
    let pullRequest = config.settings.mergeable.pull_requests
    expect(pullRequest.approvals).toBe(5)
    expect(pullRequest.title).toBe('title regex')
    expect(pullRequest.label).toBe('label regex')
  })
  expect(context.github.repos.getContent.mock.calls.length).toBe(1)
})

test('that instanceWithContext still returns the Configuration when repo does not content mergeable.yml', async () => {
  let context = {
    repo: () => {
      return {repo: '', owner: ''}
    },
    payload: {
      pull_request: {
        number: 1
      }
    },
    github: {
      repos: {
        getContent: jest.fn().mockReturnValue(
          Promise.reject(
            new HttpError(
              '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
              404,
              'Not Found')
          )
        )
      }
    }
  }

  Configuration.instanceWithContext(context).then(config => {
    let pullRequest = config.settings.mergeable.pull_requests
    expect(pullRequest.approvals).toBe(Configuration.DEFAULTS.approvals)
    expect(pullRequest.title).toBe(Configuration.DEFAULTS.title)
    expect(pullRequest.label).toBe(Configuration.DEFAULTS.label)
  }).catch(err => {
    /* global fail */
    fail('Should handle error: ' + err)
  })
  expect(context.github.repos.getContent.mock.calls.length).toBe(1)
})

// to mimic HttpError (https://github.com/octokit/rest.js/blob/fc8960ccf3415b5d77e50372d3bb873cfec80c55/lib/request/http-error.js)
class HttpError extends Error {
  constructor (message, code, status) {
    super(message)
    this.message = message
    this.code = code
    this.status = status
  }
}
