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
