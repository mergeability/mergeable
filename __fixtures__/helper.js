module.exports = {
  mockContext: (options) => {
    if (!options) options = {}

    return {
      repo: () => { return { owner: 'owner', repo: 'repo' } },
      payload: {
        pull_request: {
          user: {
            login: 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: (options.body) ? options.body : '',
          number: 1,
          head: { sha: 'sha1' },
          assignees: (options.assignees) ? options.assignees : []
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
          },
          get: () => {
            return {data: (options.milestone) ? {milestone: options.milestone} : {}}
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
