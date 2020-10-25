const _ = require('lodash')
const yaml = require('js-yaml')

const throwNotFound = () => {
  let error = new Error('404 error')
  error.status = 404
  throw error
}

module.exports = {
  mockContext: (options = {}) => {
    return {
      repo: (properties) => { return Object.assign({ owner: 'owner', repo: 'repo' }, properties) },
      event: (options.event) ? options.event : 'pull_request',
      payload: {
        sha: 'sha1',
        action: 'opened',
        repository: {
          full_name: 'name'
        },
        check_suite: {
          pull_requests: [
            {
              number: 1
            }
          ]
        },
        pull_request: {
          user: {
            login: 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: options.body,
          number: (options.number) ? options.number : 1,
          milestone: (options.milestone) ? options.milestone : null,
          requested_reviewers: options.requestedReviewers ? options.requestedReviewers : [],
          base: {
            repo: { full_name: options.baseRepo ? options.baseRepo : 'owner/test' },
            ref: 'baseRef',
            sha: 'sha2'
          },
          head: {
            ref: 'test',
            sha: 'sha1',
            repo: {
              full_name: options.headRepo ? options.headRepo : 'owner/test',
              issues_url: 'testRepo/issues{/number}'
            }},
          assignees: (options.assignees) ? options.assignees : []
        },
        issue: {
          user: {
            login: 'creator'
          },
          number: (options.number) ? options.number : 1
        }
      },
      log: {
        child: (s) => {
          return {
            debug: (...s) => jest.fn(),
            info: (...s) => jest.fn(),
            warn: (...s) => jest.fn()
          }
        }
      },
      github: {
        repos: {
          createStatus: () => {},
          listCollaborators: () => {
            return { data: (options.collaborators) ? options.collaborators : [] }
          },
          getContents: ({ path }) => {
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
        teams: {
          listMembersInOrg: options.listMembers ? () => ({ data: options.listMembers }) : () => ({ data: [] })
        },
        pulls: {
          listFiles: {
            endpoint: {
              merge: async () => {
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
                  return { data: options.files ? options.files : [] }
                }
              }
            }
          },
          list: () => ({
            data: options.prList ? options.prList : []
          }),
          listCommits: {
            endpoint: {
              merge: async () => {
                return { data: (options.commits) ? options.commits : [] }
              }
            }
          },
          listReviews: {
            endpoint: {
              merge: async () => {
                return { data: (options.reviews) ? options.reviews : [] }
              }
            }
          },
          checkIfMerged: async () => {
            if (options.checkIfMerged === false) {
              return throwNotFound()
            } else {
              return { status: 204 }
            }
          },
          merge: jest.fn(),
          get: jest.fn()
        },
        paginate: jest.fn(async (fn, cb) => {
          return fn.then(cb)
        }),
        projects: {
          listForRepo: () => {
            return { data: (options.repoProjects) ? options.repoProjects : [] }
          },
          listColumns: () => {
            return { data: (options.projectColumns) ? options.projectColumns : [] }
          },
          listCards: () => {
            return { data: (options.projectCards) ? options.projectCards : [] }
          }
        },
        issues: {
          listLabelsOnIssue: () => {
            return { data: (options.labels) ? options.labels : [] }
          },
          checkAssignee: () => {
            return new Promise((resolve) => {
              resolve({ status: 204 })
            })
          },
          listComments: () => {
            return { data: (options.listComments) ? options.listComments : [] }
          },
          replaceLabels: jest.fn(),
          addLabels: jest.fn(),
          update: jest.fn(),
          get: () => {
            return {data: (options.deepValidation) ? options.deepValidation : {}}
          }
        }
      },
      probotContext: {
        config: jest.fn().mockResolvedValue(options.configJson)
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
    context.github.repos.getContents = () => {
      return Promise.resolve({ data: {
        content: Buffer.from(configString).toString('base64') }
      })
    }
    context.probotContext.config = () => {
      return Promise.resolve(yaml.safeLoad(configString))
    }
  }
}
