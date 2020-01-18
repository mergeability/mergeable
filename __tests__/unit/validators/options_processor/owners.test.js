const Helper = require('../../../../__fixtures__/unit/helper')
const owners = require('../../../../lib/validators/options_processor/owners')

test('that * works', async () => {
  const codeowner = `* @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.js'])
  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['another/file/path/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that *.js (fileType) works', async () => {
  let codeowner = `*.js @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/dir/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  codeowner = `*.go @bob`
  commitDiffs = createCommitDiffs(['another/file/path/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(0)

  codeowner = `*.go @bob`
  commitDiffs = createCommitDiffs(['another/file/path/test.go'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that /docs/ only matches docs directory in root', async () => {
  let codeowner = ` /docs/ @bob`
  let commitDiffs = createCommitDiffs(['/docs/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['another/file/docs/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(0)
})

test('that /docs/ only matches all files in all subdirectory', async () => {
  let codeowner = `/docs/ @bob`
  let commitDiffs = createCommitDiffs(['/docs/long/path/to/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['docs/test/anotherTest.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that /docs/* only matches all files in that directory', async () => {
  let codeowner = `/docs/* @bob`
  let commitDiffs = createCommitDiffs(['/docs/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['/docs/not/matching/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(0)
})

test('that **/docs matches all files and directories in docs/', async () => {
  let codeowner = `**/docs @bob`
  let commitDiffs = createCommitDiffs(['first/second/docs/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['first/second/docs/inside/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that /docs/**/apps/ matches the sub directories properly', async () => {
  let codeowner = `/docs/**/apps/ @bob`
  let commitDiffs = createCommitDiffs(['/docs/second/third/apps/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['/docs/third/apps/inside/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that /apps/** matches all the sub directories of app', async () => {
  let codeowner = `/apps/** @bob`
  let commitDiffs = createCommitDiffs(['/apps/second/third/dir/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['/apps/file/path/test.go'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that apps/ matches all instances of app/', async () => {
  let codeowner = `apps/ @bob`
  let commitDiffs = createCommitDiffs(['first/second/third/apps/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')

  commitDiffs = createCommitDiffs(['another/file/path/apps/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

test('that rules that comes later takes higher priority', async () => {
  let codeowner = `*.js @bob \n/docs/ @hope`
  let commitDiffs = createCommitDiffs(['/docs/test.js'])

  let res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('hope')

  commitDiffs = createCommitDiffs(['another/file/path/test.js'])

  res = await owners.process(createMockPR(), createMockContext(codeowner, commitDiffs))
  expect(res.length).toBe(1)
  expect(res[0]).toBe('bob')
})

const createMockPR = () => {
  return Helper.mockContext({
    user: {
      login: 'creator'
    },
    number: 1
  }).payload.pull_request
}

const createCommitDiffs = (diffs) => {
  return diffs.map(diff => ({
    filename: diff
  }))
}

const createMockContext = (owners, commitDiffs, data) => {
  return Helper.mockContext({reviews: data, codeowners: Buffer.from(`${owners}`).toString('base64'), compareCommits: commitDiffs})
}
