const Helper = require('../../__fixtures__/helper')
const Size = require('../../lib/validators/size')

describe('PR size validator', () => {
  const FILES = [
    {
      filename: 'thing.js',
      status: 'modified',
      additions: 10,
      deletions: 5,
      changes: 15
    },
    {
      filename: 'another.js',
      status: 'added',
      additions: 3,
      deletions: 2,
      changes: 5
    },
    {
      filename: 'removed_file_should_be_ignored.js',
      status: 'removed',
      additions: 0,
      deletions: 500,
      changes: 500
    }
  ]

  test('fails when size above max', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 10,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('fail')
    expect(validation.validations[0].description).toBe('Too big!')
  })

  test('passes when changes below max', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 50,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')
  })

  test('passes when changes equal to max', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 20,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')
  })

  test('ignores specified files', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 15,
          message: 'Too big!'
        }
      },
      ignore: ['another.js']
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')
  })

  test('ignores glob patterns', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 15,
          message: 'Too big!'
        }
      },
      ignore: ['nested/one/*', 'nested/two/**']
    }

    let files = [
      {
        filename: 'not_too_big.js',
        status: 'modified',
        additions: 10,
        deletions: 0,
        changes: 10
      },
      {
        filename: 'nested/one/big_file_1.js',
        status: 'added',
        additions: 30,
        deletions: 0,
        changes: 30
      },
      {
        filename: 'nested/one/big_file_2.js',
        status: 'added',
        additions: 30,
        deletions: 0,
        changes: 30
      },
      {
        filename: 'nested/two/three/big_file_3.js',
        status: 'modified',
        additions: 30,
        deletions: 0,
        changes: 30
      }
    ]

    let validation = await size.validate(createMockContext(files), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')

    settings.ignore = ['**/big_file_*.js']

    validation = await size.validate(createMockContext(files), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')
  })

  test('handles empty ignore args', async () => {
    const size = new Size()
    let settings = {
      do: 'size',
      lines: {
        max: {
          count: 15,
          message: 'Too big!'
        }
      },
      ignore: []
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('fail')
    expect(validation.validations[0].description).toBe('Too big!')

    settings = {
      do: 'size',
      lines: {
        max: {
          count: 50,
          message: 'Too big!'
        }
      },
      ignore: []
    }

    validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size is OK!')
  })
})

const createMockContext = (files) => {
  return Helper.mockContext({
    files: files
  })
}
