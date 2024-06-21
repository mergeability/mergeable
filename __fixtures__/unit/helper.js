const _ = require('lodash')
const yaml = require('js-yaml')

const throwNotFound = () => {
  const error = new Error('404 error')
  error.status = 404
  throw error
}

module.exports = {
  mockContext: (options = {}) => {
    return {
      repo: (properties) => { return Object.assign({ owner: 'owner', repo: 'repo' }, properties) },
      eventName: (options.eventName) ? options.eventName : 'pull_request',
      payload: {
        sha: 'sha1',
        action: 'opened',
        repository: {
          name: (options.repoName) ? options.repoName : 'repoName',
          full_name: 'fullRepoName',
          owner: {
            login: 'owner'
          }
        },
        sender: {
          login: 'initiator'
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
            login: options.author ? options.author : 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: options.body,
          number: (options.number) ? options.number : 1,
          created_at: (options.createdAt) ? options.createdAt : new Date().toISOString(),
          updated_at: (options.updatedAt) ? options.updatedAt : new Date().toISOString(),
          milestone: (options.milestone) ? options.milestone : null,
          requested_reviewers: options.requestedReviewers ? options.requestedReviewers : [],
          requested_teams: options.requestedTeams ? options.requestedTeams : [],
          base: {
            repo: {
              full_name: options.baseRepo ? options.baseRepo : 'owner/test',
              private: (options.repoPrivate) ? options.repoPrivate : false
            },
            ref: options.baseRef ? options.baseRef : 'baseRef',
            sha: 'sha2'
          },
          head: {
            ref: 'test',
            sha: 'sha1',
            repo: {
              full_name: options.headRepo ? options.headRepo : 'owner/test',
              issues_url: 'testRepo/issues{/number}'
            }
          },
          assignees: (options.assignees) ? options.assignees : []
        },
        issue: {
          user: {
            login: 'creator'
          },
          title: (options.title) ? options.title : 'title',
          body: options.body,
          number: (options.number) ? options.number : 1,
          milestone: (options.milestone) ? options.milestone : null,
          created_at: (options.createdAt) ? options.createdAt : new Date().toISOString(),
          updated_at: (options.updatedAt) ? options.updatedAt : new Date().toISOString(),
          assignees: (options.assignees) ? options.assignees : [],
          pull_request: {}
        },
        comment: options.issueComment
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
      octokit: {
        repos: {
          createStatus: () => {},
          listCollaborators: () => {
            return { data: (options.collaborators) ? options.collaborators : [] }
          },
          getContent: ({ path }) => {
            return new Promise((resolve, reject) => {
              if (path === '.github/mergeable.yml') {
                throwNotFound()
              }

              if (path === '.github/CODEOWNERS') {
                return options.codeowners
                  ? resolve({
                      data: {
                        content: options.codeowners
                      }
                    })
                  : throwNotFound()
              }
            })
          },
          compareCommits: () => {
            return new Promise(resolve => {
              resolve({
                data: {
                  files: options.compareCommits
                }
              })
            })
          },
          getAllTopics: () => {
            return new Promise(resolve => {
              resolve({
                data: {
                  names: (options.repoTopics) ? options.repoTopics : []
                }
              })
            })
          }
        },
        checks: {
          create: () => {
            return {
              data: {
                id: 1
              }
            }
          },
          update: () => {
            return {}
          }
        },
        teams: {
          listMembersInOrg: options.listMembers ? () => ({ data: options.listMembers }) : () => ({ data: [] }),
          getMembershipForUserInOrg: options.membership ? () => ({ data: { state: options.membership } }) : () => ({ data: { state: false } })
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
          requestReviewers: jest.fn().mockReturnValue(options.requestReviewers || 'request review success'),
          merge: jest.fn().mockReturnValue(options.merge || 'merged'),
          get: jest.fn().mockReturnValue({ data: { head: { ref: 'test', sha: 'sha1' } } })
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
          checkUserCanBeAssigned: () => {
            return new Promise((resolve) => {
              resolve({ status: 204 })
            })
          },
          listComments: {
            endpoint: {
              merge: () => Promise.resolve({ data: (options.comments) ? options.comments : [] })
            }
          },
          createComment: jest.fn().mockReturnValue(options.createComment || 'createComment call success'),
          deleteComment: jest.fn().mockReturnValue(options.deleteComment || 'deleteComment call success'),
          addAssignees: jest.fn().mockReturnValue(options.addAssignees || 'addAssignees call success'),
          setLabels: jest.fn().mockReturnValue(options.setLabels || 'setLabels call success'),
          addLabels: jest.fn().mockReturnValue(options.addLabels || 'addLabels call success'),
          update: jest.fn().mockReturnValue(options.updateIssues || 'update Issues call success'),
          get: () => {
            return { data: (options.deepValidation) ? options.deepValidation : {} }
          }
        },
        search: {
          issuesAndPullRequests: jest.fn().mockReturnValue({ data: { items: options.issuesAndPullRequests || [] } })
        }
      },
      probotContext: {
        config: jest.fn().mockResolvedValue(options.configJson)
      },
      globalSettings: {}
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
    context.octokit.repos.getContent = () => {
      return Promise.resolve({
        data: { content: Buffer.from(configString).toString('base64') }
      })
    }
    context.probotContext.config = () => {
      return Promise.resolve(yaml.safeLoad(configString))
    }
  },

  flushPromises: () => {
    // https://stackoverflow.com/questions/49405338/jest-test-promise-resolution-and-event-loop-tick
    return new Promise(resolve => setImmediate(resolve))
  }
}
