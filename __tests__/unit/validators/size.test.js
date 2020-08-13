const Helper = require('../../../__fixtures__/unit/helper')
const Size = require('../../../lib/validators/size')

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

  test('errors if both max and total are passed', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        max: {
          count: 10,
          message: 'Too big!'
        },
        total: {
          count: 10,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('error')
    expect(validation.validations[0].description).toBe('Options max and total cannot be used together. Please choose one')
    expect(validation.validations[0].status).toBe('error')
  })

  test('backwards compatibility test for max and total', async () => {
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
    expect(validation.validations[0].status).toBe('fail')
  })

  test('errors if invalid configurations is passed', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        something: {
          count: 10,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    const ERROR_MESSAGE = `Failed to validate because the 'lines' or 'max / total', 'additions' or 'deletions' option is missing. Please check the documentation.`
    expect(validation.status).toBe('error')
    expect(validation.validations[0].description).toBe(ERROR_MESSAGE)
    expect(validation.validations[0].status).toBe('error')
  })

  test('fails when size of changes is above count', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        additions: {
          count: 10,
          message: 'Too big!'
        },
        deletions: {
          count: 5,
          message: 'Too big!'
        },
        total: {
          count: 10,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('fail')
    expect(validation.validations[0].description).toBe('Too big!')
    expect(validation.validations[0].status).toBe('fail')
    expect(validation.validations[1].description).toBe('Too big!')
    expect(validation.validations[1].status).toBe('fail')
    expect(validation.validations[2].description).toBe('Too big!')
    expect(validation.validations[2].status).toBe('fail')
  })

  test('passes when changes equal to count', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        additions: {
          count: 13,
          message: 'Too big!'
        },
        deletions: {
          count: 7,
          message: 'Too big!'
        },
        total: {
          count: 20,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('PR size for deletions is OK!')
    expect(validation.validations[1].status).toBe('pass')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')
  })

  test('partial fails and passing when part of PR is within count', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        additions: {
          count: 13,
          message: 'Too big!'
        },
        deletions: {
          count: 5,
          message: 'Too big!'
        },
        total: {
          count: 20,
          message: 'Too big!'
        }
      }
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('fail')
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('Too big!')
    expect(validation.validations[1].status).toBe('fail')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')
  })

  test('ignores specified files', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        additions: {
          count: 10,
          message: 'Too big!'
        },
        deletions: {
          count: 5,
          message: 'Too big!'
        },
        total: {
          count: 15,
          message: 'Too big!'
        }
      },
      ignore: ['another.js']
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('PR size for deletions is OK!')
    expect(validation.validations[1].status).toBe('pass')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')
  })

  test('ignores glob patterns', async () => {
    const size = new Size()
    const settings = {
      do: 'size',
      lines: {
        additions: {
          count: 10,
          message: 'Too big!'
        },
        deletions: {
          count: 5,
          message: 'Too big!'
        },
        total: {
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
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('PR size for deletions is OK!')
    expect(validation.validations[1].status).toBe('pass')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')

    settings.ignore = ['**/big_file_*.js']

    validation = await size.validate(createMockContext(files), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('PR size for deletions is OK!')
    expect(validation.validations[1].status).toBe('pass')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')
  })

  test('handles empty ignore args', async () => {
    const size = new Size()
    let settings = {
      do: 'size',
      lines: {
        additions: {
          count: 10,
          message: 'Too big!'
        },
        deletions: {
          count: 5,
          message: 'Too big!'
        },
        total: {
          count: 15,
          message: 'Too big!'
        }
      },
      ignore: []
    }

    let validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('fail')
    expect(validation.validations[0].description).toBe('Too big!')
    expect(validation.validations[0].status).toBe('fail')
    expect(validation.validations[1].description).toBe('Too big!')
    expect(validation.validations[1].status).toBe('fail')
    expect(validation.validations[2].description).toBe('Too big!')
    expect(validation.validations[2].status).toBe('fail')

    settings = {
      do: 'size',
      lines: {
        additions: {
          count: 13,
          message: 'Too big!'
        },
        deletions: {
          count: 7,
          message: 'Too big!'
        },
        total: {
          count: 20,
          message: 'Too big!'
        }
      },
      ignore: []
    }

    validation = await size.validate(createMockContext(FILES), settings)
    expect(validation.status).toBe('pass')
    expect(validation.validations[0].description).toBe('PR size for additions is OK!')
    expect(validation.validations[0].status).toBe('pass')
    expect(validation.validations[1].description).toBe('PR size for deletions is OK!')
    expect(validation.validations[1].status).toBe('pass')
    expect(validation.validations[2].description).toBe('PR size for total additions + deletions is OK!')
    expect(validation.validations[2].status).toBe('pass')
  })
})

const createMockContext = (files) => {
  return Helper.mockContext({
    files: files
  })
}
