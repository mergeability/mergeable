const Helper = require('../../../__fixtures__/unit/helper')
const Contents = require('../../../lib/validators/contents')

test('files pr_diff option works correctly', async () => {
  const contents = new Contents()
  const settings = {
    do: 'contents',
    files: {
      pr_diff: true
    },
    must_exclude: {
      regex: 'test'
    }
  }

  let validation = await contents.processValidate(createMockContext(['package.json'], 'testString'), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description.includes('package.json')).toBe(true)

  validation = await contents.processValidate(createMockContext(['package.json'], 'string'), settings)
  expect(validation.status).toBe('pass')
})

test('files ignore option works correctly', async () => {
  const contents = new Contents()
  let settings = {
    do: 'contents',
    files: {
      pr_diff: true
    },
    must_exclude: {
      regex: 'test'
    }
  }

  let validation = await contents.processValidate(createMockContext(['.github/mergeable.yml', 'package.json'], 'testString'), settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe("Failed files : 'package.json'")

  settings = {
    do: 'contents',
    files: {
      pr_diff: true,
      ignore: ['package.json']
    },
    must_exclude: {
      regex: 'test'
    }
  }

  validation = await contents.processValidate(createMockContext(['package.json'], 'string'), settings)
  expect(validation.status).toBe('pass')
})

test('fail gracefully if content is not found', async () => {
  const context = Helper.mockContext({ files: ['package.json'] })

  context.octokit.repos.getContent = jest.fn().mockReturnValue(
    Promise.reject(
      new HttpError(
        '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
        404)
    )
  )

  const contents = new Contents()
  const settings = {
    do: 'contents',
    files: {
      pr_diff: true
    },
    must_exclude: {
      regex: 'test'
    }
  }

  const validation = await contents.processValidate(context, settings)
  expect(validation.status).toBe('fail')
  expect(validation.validations[0].description).toBe("Failed files : 'package.json (Not Found)'")
})

const createMockContext = (files, fileContent) => {
  const context = Helper.mockContext({ files: files })

  context.octokit.repos.getContent = () => {
    return Promise.resolve({
      data: { content: Buffer.from(fileContent).toString('base64') }
    })
  }

  return context
}

// to mimic HttpError (https://github.com/octokit/rest.js/blob/fc8960ccf3415b5d77e50372d3bb873cfec80c55/lib/request/http-error.js)
class HttpError extends Error {
  constructor (message, status) {
    super(message)
    this.message = message
    this.status = status
  }
}
