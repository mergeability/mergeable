const searchAndReplaceSpecialAnnotations = require('../../../../lib/actions/lib/searchAndReplaceSpecialAnnotation')

describe('searchAndReplaceSpecialAnnotations', () => {
  test('does not affect input if no special annotations are found', () => {
    let payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('no special annotations', payload)).toBe('no special annotations')
  })

  test('special annotation at the beginning of string works properly', () => {
    let payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('@author says hello!', payload)).toBe('creator says hello!')
  })

  test('escape character works properly', () => {
    let payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is \\@author', payload)).toBe('this is @author')
  })

  test('@author is replaced by payload.user.login', () => {
    let payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is @author', payload)).toBe('this is creator')
  })
})
