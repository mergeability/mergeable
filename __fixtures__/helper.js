module.exports = {
  mockContext: (options) => {
    if (!options) options = {}

    return {
      repo: (properties) => { return Object.assign({ owner: 'owner', repo: 'repo' }, properties) },
      payload: {
        pull_request: {
          user: {
            login: 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: (options.body) ? options.body : '',
          number: (options.number) ? options.number : 1,
          base: {
            ref: 'baseRef',
            sha: 'sha2'
          },
          head: {
            ref: 'test',
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
          getContent: ({ path }) => {
            return new Promise((resolve, reject) => {
              if (path === '.github/mergeable.yml') {
                let error = new Error('404 error')
                error.code = 404
                throw error
              }

              if (path === '.github/CODEOWNERS') {
                return options.codeowners ? resolve({ data: {
                  content: options.codeowners
                }}) : resolve()
              }
            })
          },
          compareCommits: () => {
            return new Promise(resolve => {
              resolve({ data: {
                files: options.compareCommits
              }})
            })
          }
        },
        checks: {
          create: () => {
            return { data: {
              id: 1
            }}
          },
          update: () => {
            return {}
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
      check_run_id: 1,
      conclusion: status,
      name: 'Mergeable',
      output: {
        title: `Result: ${status}`,
        summary: description
      },
      status: 'completed'
    }
  },

  mockConfigWithContext: (context, configString) => {
    context.github.repos.getContent = () => {
      return Promise.resolve({ data: {
        content: Buffer.from(configString).toString('base64') }
      })
    }
  }

}
