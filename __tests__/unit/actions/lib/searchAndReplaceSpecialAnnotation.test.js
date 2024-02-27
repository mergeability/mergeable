const searchAndReplaceSpecialAnnotations = require('../../../../lib/actions/lib/searchAndReplaceSpecialAnnotation')

describe('searchAndReplaceSpecialAnnotations', () => {
  test('does not affect input if no special annotations are found', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('no special annotations', payload)).toBe('no special annotations')
  })

  test('special annotation at the beginning of string works properly', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('@author says hello!', payload)).toBe('creator says hello!')
  })

  test('escape character works properly', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is \\@author', payload)).toBe('this is @author')
  })

  test('@author is replaced by payload.user.login', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is @author', payload)).toBe('this is creator')
  })

  test('@@author is replaced by @payload.user.login', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is @@author', payload)).toBe('this is @creator')
  })

  test('replaces annotation anywhere in the text', () => {
    const payload = {
      user: {
        login: 'creator'
      }
    }
    expect(searchAndReplaceSpecialAnnotations('this is something@author speaking', payload)).toBe('this is somethingcreator speaking')
  })
})
