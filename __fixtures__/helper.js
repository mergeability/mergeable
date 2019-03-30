const _ = require('lodash')

const throwNotFound = () => {
  let error = new Error('404 error')
  error.code = 404
  throw error
}

module.exports = {
  mockContext: (options = {}) => {
    return {
      repo: (properties) => { return Object.assign({ owner: 'owner', repo: 'repo' }, properties) },
      event: (options.event) ? options.event : 'pull_request',
      payload: {
        repository: {
          full_name: 'name'
        },
        pull_request: {
          user: {
            login: 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: options.body,
          number: (options.number) ? options.number : 1,
          milestone: (options.milestone) ? options.milestone : null,
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
      log: {
        child: (s) => {
          return {
            debug: (s) => console.log(`TEST[debug] > ${JSON.stringify(s)}`),
            info: (s) => console.log(`TEST[info] > ${JSON.stringify(s)}`),
            warn: (s) => console.log(`TEST[warn] > ${JSON.stringify(s)}`)
          }
        }
      },
      github: {
        repos: {
          createStatus: () => {},
          getContent: ({ path }) => {
            return new Promise((resolve, reject) => {
              if (path === '.github/mergeable.yml') {
                throwNotFound()
              }

              if (path === '.github/CODEOWNERS') {
                return options.codeowners ? resolve({ data: {
                  content: options.codeowners
                }}) : throwNotFound()
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
          getFiles: () => {
            if (_.isString(options.files && options.files[0])) {
              return {
                data: options.files.map(
                  file => ({
                    filename: file.filename || file,
                    status: file.status || 'modified',
                    additions: file.additions || 0,
                    deletions: file.deletions || 0,
                    changes: file.changes || 0
                  })
                )
              }
            } else {
              return { data: options.files && options.files }
            }
          },
          getReviews: async () => {
            return { data: (options.reviews) ? options.reviews : [] }
          }
        },
        paginate: jest.fn(async (fn, cb) => {
          return fn.then(cb)
        }),
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
            return {data: (options.deepValidation) ? options.deepValidation : {}}
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

  mockConfigWithContext: (context, configString, options) => {
    context.github.repos.getContent = () => {
      return Promise.resolve({ data: {
        content: Buffer.from(configString).toString('base64') }
      })
    }
    context.github.pullRequests.getFiles = () => {
      return Promise.resolve({
        data: options && options.files ? options.files.map(file => ({ filename: file, status: 'modified' })) : []
      })
    }
  }
}
