module.exports = {
  mockContext: (options) => {
    if (!options) options = {}

    return {
      repo: () => { return { owner: 'owner', repo: 'repo' } },
      payload: {
        pull_request: {
          title: (options.title) ? options.title : 'title',
          body: (options.body) ? options.body : '',
          number: 1,
          head: { sha: 'sha1' }
        }
      },
      github: {
        repos: {
          createStatus: () => {},
          getContent: () => {
            return new Promise(resolve => {
              let error = new Error('404 error')
              error.code = 404
              throw error
            })
          }
        },
        pullRequests: {
          getReviews: () => {
            return { data: (options.reviews) ? options.reviews : [] }
          }
        },
        issues: {
          getIssueLabels: () => {
            return { data: (options.labels) ? options.labels : [] }
          }
        }
      }
    }
  },

  expectedStatus: (status, description) => {
    return {
      context: 'Mergeable',
      description: description,
      sha: 'sha1',
      state: status,
      target_url: 'https://github.com/apps/mergeable'
    }
  }

}
