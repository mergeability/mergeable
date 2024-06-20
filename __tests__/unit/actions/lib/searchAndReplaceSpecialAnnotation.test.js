const searchAndReplaceSpecialAnnotations = require('../../../../lib/actions/lib/searchAndReplaceSpecialAnnotation')

describe('searchAndReplaceSpecialAnnotations', () => {
  const SPECIAL_ANNOTATION = {
    '@author': 'creator',
    '@action': 'created',
    '@sender': 'initiator',
    '@bot': 'Mergeable[bot]',
    '@repository': 'botrepo'
  }
  const tests = [
    {
      name: 'does not affect input if no special annotations are found',
      message: 'no special annotations',
      expected: 'no special annotations'
    },
    {
      name: 'special annotation at the beginning of string works properly',
      message: '$annotation$ says hello!',
      expected: '$annotation$ says hello!'
    },
    {
      name: 'escape character works properly',
      message: 'this is \\@author',
      expected: 'this is @author'
    },
    {
      name: 'special annotation at the end of string works properly',
      message: 'this is $annotation$',
      expected: 'this is $annotation$'
    },
    {
      name: '@@annotation is replaced, prepending @ remains',
      message: 'this is @$annotation$',
      expected: 'this is @$annotation$'
    },
    {
      name: 'replaces special annotation anywhere in the text',
      message: 'this is something$annotation$ speaking',
      expected: 'this is something$annotation$ speaking'
    }
  ]

  test.each(tests)(
    '$name',
    async ({ message, expected }) => {
      const payload = {
        user: {
          login: 'creator'
        }
      }
      const evt = {
        action: 'created',
        repository: {
          full_name: 'botrepo'
        },
        sender: {
          login: 'initiator'
        }
      }

      for (const annotation of Object.keys(SPECIAL_ANNOTATION)) {
        const messageWithAnnotation = message.replace('$annotation$', annotation)
        const messageWithReplacement = expected.replace('$annotation$', SPECIAL_ANNOTATION[annotation])
        expect(searchAndReplaceSpecialAnnotations(messageWithAnnotation, payload, evt)).toBe(messageWithReplacement)
      }
    }
  )
})
