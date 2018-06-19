const Helper = require('../__fixtures__/helper')
const stale = require('../lib/stale')
const Configuration = require('../lib/configuration')

test('will create comment when configured and stale pulls are found.', async () => {

  // setup config.
  let config = new Configuration(`
    mergeable:
      pull_requests:
        stale:
          days: 20
    `).settings.mergeable

  // call stale
  stale(createMockContext({}), config)

  // do expect.
  // 1. setup mock
  // 2. check that the createcomment is called.
  fail()

})

test('will create comment when configured and stale issues are found.', async () => {
  fail()
})

test('will NOT create comment when configured and stale pulls are not found.', async () => {
  fail()
})

test('will NOT create comment when configured and stale issues are not found.', async () => {
  fail()
})


const createMockContext = (results) => {
  let context = helper.mockContext()

  context.github.search = jest.fn().mockReturnValue(results)
  return context
}
