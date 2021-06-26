const Title = require('../../../lib/validators/title')
const Helper = require('../../../__fixtures__/unit/helper')

test('validate returns false', async () => {
  const title = new Title()

  const settings = {
    do: 'title',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    },
    must_exclude: {
      regex: 'wip'
    }
  }
  let result = await title.processValidate(mockContext('wip'), settings)
  expect(result.status).toBe('fail')

  result = await title.processValidate(mockContext('(feat) something else'), settings)
  expect(result.status).toBe('pass')
})

test('fail gracefully if invalid regex', async () => {
  const title = new Title()

  const settings = {
    do: 'title',
    must_exclude: {
      regex: '@#$@#$@#$'
    }
  }

  const titleValidation = await title.processValidate(mockContext('WIP Title'), settings)
  expect(titleValidation.status).toBe('pass')
})

test('checks that it fail when exclude regex is in title', async () => {
  const title = new Title()

  const settings = {
    do: 'title',
    must_include: {
      regex: '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let titleValidation = await title.processValidate(mockContext('WIP Title'), settings)
  expect(titleValidation.status).toBe('fail')

  titleValidation = await title.processValidate(mockContext('(feat) WIP Title'), settings)
  expect(titleValidation.status).toBe('fail')
})

test('checks that advance setting of must_include works', async () => {
  const title = new Title()

  const includeList = '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'
  const testMessage = 'this is a test message'

  const settings = {
    do: 'title',
    must_include: {
      regex: includeList,
      message: testMessage
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let titleValidation = await title.processValidate(mockContext('include Title'), settings)
  expect(titleValidation.status).toBe('fail')
  expect(titleValidation.validations[0].description).toBe(testMessage)

  titleValidation = await title.processValidate(mockContext('(feat) WIP Title'), settings)

  expect(titleValidation.status).toBe('fail')
})

describe('begins_with', () => {
  const mockMatch = (match) => {
    return {
      do: 'title',
      begins_with: {
        match: match
      }
    }
  }

  test('checks that it fail when begins_with is not in title', async () => {
    const title = new Title()
    const match = '(test)'

    let titleValidation = await title.processValidate(mockContext('include Title'), mockMatch(match))
    expect(titleValidation.status).toBe('fail')
    expect(titleValidation.validations[0].description).toBe(`title must begins with "${match}"`)

    titleValidation = await title.processValidate(mockContext('(test) WIP Title'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
  })

  test('with match as arrays', async () => {
    const title = new Title()
    const match = ['test1', 'test2']

    let titleValidation = await title.processValidate(mockContext('include Title'), mockMatch(match))
    expect(titleValidation.status).toBe('fail')
    expect(titleValidation.validations[0].description).toBe(`title must begins with "${match}"`)

    titleValidation = await title.processValidate(mockContext('test1 WIP Title'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
    titleValidation = await title.processValidate(mockContext('test2 WIP Title'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
  })
})

describe('ends_with', () => {
  const mockMatch = (match) => {
    return {
      do: 'title',
      ends_with: {
        match: match
      }
    }
  }

  test('checks that it fail when ends_with is not in title', async () => {
    const title = new Title()
    const match = '(test)'

    let titleValidation = await title.processValidate(mockContext('include Title'), mockMatch(match))
    expect(titleValidation.status).toBe('fail')
    expect(titleValidation.validations[0].description).toBe(`title must end with "${match}"`)

    titleValidation = await title.processValidate(mockContext('WIP Title (test)'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
  })

  test('with array', async () => {
    const title = new Title()
    const match = ['test', 'test2']

    let titleValidation = await title.processValidate(mockContext('include Title'), mockMatch(match))
    expect(titleValidation.status).toBe('fail')
    expect(titleValidation.validations[0].description).toBe(`title must end with "${match}"`)

    titleValidation = await title.processValidate(mockContext('WIP Title test'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
    titleValidation = await title.processValidate(mockContext('WIP Title test2'), mockMatch(match))
    expect(titleValidation.status).toBe('pass')
  })
})

test('checks that it fail when include regex is in title', async () => {
  const title = new Title()
  const includeList = '^\\(feat\\)|^\\(doc\\)|^\\(fix\\)'

  const settings = {
    do: 'title',
    must_include: {
      regex: includeList
    },
    must_exclude: {
      regex: 'wip'
    }
  }

  let titleValidation = await title.processValidate(mockContext('include Title'), settings)
  expect(titleValidation.status).toBe('fail')
  expect(titleValidation.validations[0].description).toBe(`title does not include "${includeList}"`)

  titleValidation = await title.processValidate(mockContext('(feat) WIP Title'), settings)

  expect(titleValidation.status).toBe('fail')
})

const mockContext = title => {
  const context = Helper.mockContext({ title: title })
  return context
}
