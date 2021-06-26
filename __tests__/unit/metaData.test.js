const MetaData = require('../../lib/metaData')

const dataText = '<!-- #mergeable-data {"id":1,"eventName":"issues","action":"milestoned"} #mergeable-data -->'

test('#deserialize', () => {
  const json = MetaData.deserialize(`
    #### :x: Validator: TITLE * :x:
      ***title must begins with "feat,test,chore"
      *** Input : use-case: title Settings : \`\`\`{"begins_with":{"match":["feat","test","chore"]}}\`\`\`
      <!-- #mergeable-data { "id": 1, "eventName": "pull_request", "action": "unlabeled" } #mergeable-data -->
  `)
  expect(json.id).toBe(1)
  expect(json.eventName).toBe('pull_request')
  expect(json.action).toBe('unlabeled')
})

test('#serialize', () => {
  const obj = {
    id: 1,
    eventName: 'issues',
    action: 'milestoned'
  }

  const seText = MetaData.serialize(obj)
  expect(seText).toBe(dataText)
  expect(MetaData.deserialize(seText)).toEqual(obj)
})

test('#exists', () => {
  expect(MetaData.exists(dataText)).toBe(true)
  expect(MetaData.exists('abc <!-- #mergeable-data')).toBe(false)
  expect(MetaData.exists('abc #mergeable-data -->')).toBe(false)
  expect(MetaData.exists(undefined)).toBe(false)
})
