const GithubAPI = require('../../../lib/github/api')
const Helper = require('../../../__fixtures__/unit/helper')

describe('listFiles', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.listFiles(Helper.mockContext({ files: ['abc.js', 'def.js'] }))

    expect(res.length).toEqual(2)
    expect(res[0]).toEqual({ filename: 'abc.js', additions: 0, deletions: 0, changes: 0, status: 'modified' })
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.listFiles.endpoint.merge = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listFiles(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })

  describe('searchIssuesAndPR', () => {
    test('return correct data if no error', async () => {
      const issuesAndPR = [
        'issues 1',
        'PR 2'
      ]

      const res = await GithubAPI.searchIssuesAndPR(Helper.mockContext({ issuesAndPullRequests: issuesAndPR }))
      expect(res).toEqual(issuesAndPR)
    })

    test('that error are re-thrown', async () => {
      const context = Helper.mockContext()
      context.octokit.search.issuesAndPullRequests = jest.fn().mockRejectedValue({ status: 402 })

      try {
        await GithubAPI.searchIssuesAndPR(context)
        // Fail test if above expression doesn't throw anything.
        expect(true).toBe(false)
      } catch (e) {
        expect(e.status).toBe(402)
      }
    })
  })

  describe('getContent', () => {
    test('return correct data if no error', async () => {
      const content = 'This is the content'
      const context = Helper.mockContext()
      context.octokit.repos.getContent = jest.fn().mockReturnValue({
        data: {
          content: Buffer.from(content).toString('base64')
        }
      })

      const res = await GithubAPI.getContent(context)
      expect(res).toEqual(content)
    })

    test('that 404 are simply returned null', async () => {
      const context = Helper.mockContext()
      context.octokit.repos.getContent = jest.fn().mockRejectedValue({ status: 404 })

      try {
        await GithubAPI.getContent(context)
      } catch (e) {
        // Fail test if it throws error
        expect(true).toBe(false)
      }
    })

    test('that error are re-thrown', async () => {
      const context = Helper.mockContext()
      context.octokit.repos.getContent = jest.fn().mockRejectedValue({ status: 402 })

      try {
        await GithubAPI.getContent(context)
        // Fail test if above expression doesn't throw anything.
        expect(true).toBe(false)
      } catch (e) {
        expect(e.status).toBe(402)
      }
    })
  })
})

describe('createChecks', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.createChecks(Helper.mockContext())

    expect(res.data.id).toEqual(1)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.checks.create = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.createChecks(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('updateChecks', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.updateChecks(Helper.mockContext())
    expect(res).toEqual({})
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.checks.update = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.updateChecks(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listLabelsOnIssue', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.listLabelsOnIssue(Helper.mockContext({ labels: [{ name: 'one' }, { name: 'two' }] }))
    expect(res).toEqual(['one', 'two'])
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.listLabelsOnIssue = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listLabelsOnIssue(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('addLabels', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.addLabels(Helper.mockContext())
    expect(res).toEqual('addLabels call success')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.addLabels = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.addLabels(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('setLabels', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.setLabels(Helper.mockContext())
    expect(res).toEqual('setLabels call success')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.setLabels = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.setLabels(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('addAssignees', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.addAssignees(Helper.mockContext({ labels: [{ name: 'one' }, { name: 'two' }] }))
    expect(res).toEqual('addAssignees call success')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.addAssignees = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.addAssignees(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('checkUserCanBeAssigned', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.checkUserCanBeAssigned(Helper.mockContext(), '1', 'testAssignee')
    expect(res).toEqual('testAssignee')
  })

  test('that 404 are simply returned null', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.checkUserCanBeAssigned = jest.fn().mockRejectedValue({ status: 404 })

    const res = await GithubAPI.checkUserCanBeAssigned(context, '1', 'testAssignee')
    expect(res).toEqual(null)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.checkUserCanBeAssigned = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.checkUserCanBeAssigned(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('createComment', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.createComment(Helper.mockContext())
    expect(res).toEqual('createComment call success')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.createComment = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.createComment(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listComments', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.listComments(Helper.mockContext({ listComments: [{ user: { login: 'mergeable[bot]' } }, { user: { login: 'userA' } }] }))
    expect(res.data.length).toEqual(2)
    expect(res.data[0].user.login).toEqual('mergeable[bot]')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.listComments = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listComments(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('deleteComment', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.deleteComment(Helper.mockContext())
    expect(res).toEqual('deleteComment call success')
  })

  test('that error are NOT thrown for 404', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.deleteComment = jest.fn().mockRejectedValue({ status: 404 })

    try {
      await GithubAPI.deleteComment(context)
    } catch (e) {
      console.log(e)
      // Fail test if error was thrown
      expect(true).toBe(false)
    }
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.deleteComment = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.deleteComment(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('updateIssues', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.updateIssues(Helper.mockContext())
    expect(res).toEqual('update Issues call success')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.update = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.updateIssues(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('getIssues', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.getIssues(Helper.mockContext({ deepValidation: 'get Issue success' }))
    expect(res.data).toEqual('get Issue success')
  })

  test('that 404 are simply returned null', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.getIssue = jest.fn().mockRejectedValue({ status: 404 })

    try {
      await GithubAPI.getIssues(context)
    } catch (e) {
      // Fail test if it throws error
      expect(true).toBe(false)
    }
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.issues.get = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.getIssues(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listMembersInOrg', () => {
  test('return correct data if no error', async () => {
    const members = [
      { login: 'member1' },
      { login: 'member2' }
    ]

    const res = await GithubAPI.listMembersInOrg(Helper.mockContext({ listMembers: members }))
    expect(res).toEqual(['member1', 'member2'])
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.teams.listMembersInOrg = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listMembersInOrg(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('getMembershipForUserInOrg', () => {
  test('return correct data if no error', async () => {
    let res = await GithubAPI.getMembershipForUserInOrg(Helper.mockContext())
    expect(res).toEqual(false)

    res = await GithubAPI.getMembershipForUserInOrg(Helper.mockContext({ membership: 'active' }))
    expect(res).toEqual(true)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.teams.getMembershipForUserInOrg = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.getMembershipForUserInOrg(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('projectListColumns', () => {
  test('return correct data if no error', async () => {
    const projectColumns = [
      { id: '1' },
      { id: '2' }
    ]

    const res = await GithubAPI.projectListColumns(Helper.mockContext({ projectColumns }))
    expect(res).toEqual(['1', '2'])
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.projects.listColumns = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.projectListColumns(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('projectListForRepo', () => {
  test('return correct data if no error', async () => {
    const repoProjects = [
      { name: 'Project One', id: 1 },
      { name: 'Project Two', id: 2 }
    ]

    const res = await GithubAPI.projectListForRepo(Helper.mockContext({ repoProjects }))
    expect(res).toEqual(repoProjects)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.projects.listForRepo = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.projectListForRepo(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('projectListCards', () => {
  test('return correct data if no error', async () => {
    const projectCards = [
      { content_url: 'testRepo/issues/1' },
      { content_url: 'testRepo/issues/2' }
    ]

    const res = await GithubAPI.projectListCards(Helper.mockContext({ projectCards }))
    expect(res).toEqual({ data: projectCards })
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.projects.listCards = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.projectListCards(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listCollaborators', () => {
  test('return correct data if no error', async () => {
    const collaborators = [
      { login: 'member1' },
      { login: 'member2' }
    ]

    const res = await GithubAPI.listCollaborators(Helper.mockContext({ collaborators }))
    expect(res).toEqual(['member1', 'member2'])
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.repos.listCollaborators = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listCollaborators(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('getAllTopics', () => {
  test('return correct data if no error', async () => {
    const topics = [
      'topic 1',
      'topic 2'
    ]

    const res = await GithubAPI.getAllTopics(Helper.mockContext({ repoTopics: topics }))
    expect(res).toEqual(topics)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.repos.getAllTopics = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.getAllTopics(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('compareCommits', () => {
  test('return correct data if no error', async () => {
    const diff = [
      'file 1',
      'file 2'
    ]

    const res = await GithubAPI.compareCommits(Helper.mockContext({ compareCommits: diff }))
    expect(res.files).toEqual(diff)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.repos.compareCommits = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.compareCommits(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('checkIfMerged', () => {
  test('return correct data if no error', async () => {
    let res = await GithubAPI.checkIfMerged(Helper.mockContext())
    expect(res).toEqual(true)

    res = await GithubAPI.checkIfMerged(Helper.mockContext({ checkIfMerged: false }))
    expect(res).toEqual(false)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.checkIfMerged = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.checkIfMerged(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('mergePR', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.mergePR(Helper.mockContext())

    expect(res).toEqual('merged')
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.merge = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.mergePR(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('requestReviewers', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.requestReviewers(Helper.mockContext())
    expect(res).toEqual('request review success')
  })

  test('that error are NOT re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.requestReviewers = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.requestReviewers(context)
    } catch (e) {
      // fail if it throws error
      expect(true).toBe(false)
    }
  })
})

describe('getPR', () => {
  test('return correct data if no error', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.get.mockReturnValue({ data: { number: 12 } })

    const res = await GithubAPI.getPR(context)

    expect(res.data).toEqual({ number: 12 })
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.get = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.getPR(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listPR', () => {
  test('return correct data if no error', async () => {
    const res = await GithubAPI.listPR(Helper.mockContext())

    expect(res.data).toEqual([])
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.list = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listPR(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listReviews', () => {
  test('return correct data if no error', async () => {
    const reviews = [
      'review 1',
      'review 2'
    ]

    const res = await GithubAPI.listReviews(Helper.mockContext({ reviews }))
    expect(res).toEqual(reviews)
  })

  test('that error are re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.listReviews.endpoint.merge = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listReviews(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})

describe('listCommits', () => {
  test('return correct data if no error', async () => {
    const date = Date.now()
    const author = {
      date,
      name: 'Monalisa Octocat',
      email: 'support@github.com'
    }
    const committer = {
      date,
      name: 'Valdis Ferdinand',
      email: 'valdis@github.com'
    }
    const commits = [
      {
        commit: {
          author,
          committer,
          message: 'fix: this'
        }
      }
    ]

    const res = await GithubAPI.listCommits(Helper.mockContext({ commits }))
    expect(res.length).toEqual(1)
    expect(res[0].date).toEqual(date)
    expect(res[0].message).toEqual('fix: this')
    expect(res[0].author.email).toEqual('support@github.com')
    expect(res[0].committer.email).toEqual('valdis@github.com')
  })

  test('that error are NOT re-thrown', async () => {
    const context = Helper.mockContext()
    context.octokit.pulls.listCommits.endpoint.merge = jest.fn().mockRejectedValue({ status: 402 })

    try {
      await GithubAPI.listCommits(context)
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toBe(402)
    }
  })
})
