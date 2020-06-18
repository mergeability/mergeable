const Helper = require('../../../__fixtures__/unit/helper')
const Contents = require('../../../lib/validators/contents')

test.only('files pr_diff option works correctly', async () => {
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

test.only('files ignore option works correctly', async () => {
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

const createMockContext = (files, fileContent) => {
  const context = Helper.mockContext({files: files})

  context.github.repos.getContents = () => {
    return Promise.resolve({ data: {
      content: Buffer.from(fileContent).toString('base64') }
    })
  }

  return context
}
