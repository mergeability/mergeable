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
          number: (options.number) ? options.number : 1,
          head: {
            sha: 'sha1',
            repo: {
              issues_url: 'testRepo/issues{/number}'
            }},
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
        projects: {
          getRepoProjects: () => {
            return { data: (options.repoProjects) ? options.repoProjects : [] }
          },
          getProjectColumns: () => {
            return { data: (options.projectColumns) ? options.projectColumns : [] }
          },
          getProjectCards: () => {
            return { data: (options.projectCards) ? options.projectCards : [] }
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
