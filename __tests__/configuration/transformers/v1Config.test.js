const v1Config = require('../../../lib/configuration/transformers/v1Config')
const yaml = require('js-yaml')

test('check that proper format is returned, including default pass, fail and error', async () => {
  let config = `
  mergeable:
    pull_requests:
      title: 'wip'
  `
  let res = v1Config.transform(yaml.safeLoad(config))
  expect(res.mergeable[0].when).toBeDefined()
  expect(res.mergeable[0].pass).toBeDefined()
  expect(res.mergeable[0].fail).toBeDefined()
  expect(res.mergeable[0].error).toBeDefined()
})

test('checks that the content is tranformed correctly', async () => {
  let config = `
  mergeable:
    pull_requests:
      title: 'wip'
  `
  let res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable[0].validate

  expect(validate[0].do).toBe('title')
  expect(validate[0].must_exclude).toBeDefined()
  expect(validate[0].must_exclude.regex).toBeDefined()
  expect(validate[0].must_exclude.regex).toBe('wip')
})

test('check all the simple config is transformed accurately', async () => {
  let config = `
  mergeable:
    pull_requests:
      # Minimum of 5 approvals is needed.
      approvals: 5
  
      # Regular expression to be tested on the title. Not mergeable when true.  
      title: 'wip'
  
      # Only mergeable when milestone is as specified below.
      milestone: 'version 1'
  
      # Only mergeable when Project is as specified below
      project: 'Alpha'
  
      # exclude any of the mergeable validation above. A comma separated list. For example, the following will exclude validations for approvals and label.
      exclude: 'title, label'
  
    issues:
        # Regular expression. In this example, whenever a issues has a label with the word 'wip'
        label: 'wip|do not merge|experimental'
        
        # Regular expression to be tested on the title. Not mergeable when true.  
        title: 'wip'
  `
  let res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable
  expect(validate.length).toBe(2)
  const issues = (validate.filter(item => item.when.includes('issues')))[0].validate
  const pr = (validate.filter(item => item.when.includes('pull_request')))[0].validate

  expect(issues.length).toBe(2)
  expect(issues[0].do).toBe('label')
  expect(issues[0].must_exclude).toBeDefined()
  expect(issues[0].must_exclude.regex).toBe('wip|do not merge|experimental')
  expect(issues[1].do).toBe('title')
  expect(issues[1].must_exclude).toBeDefined()
  expect(issues[1].must_exclude.regex).toBe('wip')
  expect(pr.length).toBe(3) // note title was excluded
  expect(pr[0].do).toBe('approvals')
  expect(pr[0].min).toBeDefined()
  expect(pr[0].min.count).toBe(5)
  expect(pr[1].do).toBe('milestone')
  expect(pr[1].must_include).toBeDefined()
  expect(pr[1].must_include.regex).toBe('version 1')
  expect(pr[2].do).toBe('project')
  expect(pr[2].must_include).toBeDefined()
  expect(pr[2].must_include.regex).toBe('Alpha')
})

test('checks all advanced config is transformed accurately', async () => {
  const config = `
  mergeable:
    pull_requests:
      approvals:
        min:
          count: 5
          message: 'Custom message...'
        required:
          reviewers: [ user1, user2 ]   # list of github usernames required to review
          owners: true | false # will read the file .github/CODEOWNER and make them required reviewers
          message: 'Custom message...'

      assignee:
        min: 
          count: 1
        max: 
          count: 3
        message: 'Custom message...'

      dependent:
        files: ['package.json', 'yarn.lock'] # list of files that all must be modified if one is modified
        message: 'Custom message...'

    issues:
      stale:
        # number of days for an issue to be considered stale. A comment is posted when it is stale.  
        days: 20
        # Optional property. When not specified the default is used. The default message is used.
        message: 'This is issue is stale. Please follow up!'
      title:
        ends_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Custom message...'

      label:
        begins_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Come message...'

      milestone:
        must_include:
          regex: 'Release 1'
          message: 'Custom message...'

      project:
        must_exclude:
          regex: 'jibberish'
          message: 'Custom message...'
   `
  let res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable
  expect(validate.length).toBe(2)
  const issues = (validate.filter(item => item.when.includes('issues')))[0].validate
  const pr = (validate.filter(item => item.when.includes('pull_request')))[0].validate

  expect(issues.length).toBe(5)
  expect(issues[0].do).toBe('stale')
  expect(issues[0].days).toBe(20)
  expect(issues[1].do).toBe('title')
  expect(issues[1].ends_with).toBeDefined()
  expect(issues[1].ends_with.match).toBe('(feat)|(doc)|(fix)')
  expect(issues[2].do).toBe('label')
  expect(issues[2].begins_with).toBeDefined()
  expect(issues[2].begins_with.match).toBe('(feat)|(doc)|(fix)')
  expect(issues[3].do).toBe('milestone')
  expect(issues[3].must_include).toBeDefined()
  expect(issues[3].must_include.regex).toBe('Release 1')
  expect(issues[4].do).toBe('project')
  expect(issues[4].must_exclude).toBeDefined()
  expect(issues[4].must_exclude.regex).toBe('jibberish')
  expect(pr.length).toBe(3)
  expect(pr[0].do).toBe('approvals')
  expect(pr[0].min).toBeDefined()
  expect(pr[0].min.count).toBe(5)
  expect(pr[0].required).toBeDefined()
  expect(pr[0].required.reviewers.length).toBe(2)
  expect(pr[1].do).toBe('assignee')
  expect(pr[1].min).toBeDefined()
  expect(pr[1].min.count).toBe(1)
  expect(pr[1].max).toBeDefined()
  expect(pr[1].max.count).toBe(3)
  expect(pr[2].do).toBe('dependent')
  expect(pr[2].files).toBeDefined()
  expect(pr[2].files.length).toBe(2)
})
