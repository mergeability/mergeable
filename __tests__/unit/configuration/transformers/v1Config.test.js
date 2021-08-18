const v1Config = require('../../../../lib/configuration/transformers/v1Config')
const yaml = require('js-yaml')

describe('Description no empty scenarios transformations', () => {
  const verify = (config) => {
    const res = v1Config.transform(yaml.safeLoad(config))
    const dv = res.mergeable[0].validate[0]

    expect(res.mergeable[0].when).toBeDefined()
    expect(dv.do).toBe('description')
    expect(dv.no_empty).toBeDefined()
    expect(dv.no_empty.enabled).toBe(true)
  }

  test('no_empty using simple config ', () => {
    const config = `
    mergeable:
      pull_requests:
        description:
          no_empty: true
    `

    verify(config)
  })

  test('no_empty using advanced config ', () => {
    const config = `
    mergeable:
      pull_requests:
        description:
          no_empty:
            enabled: true
    `
    verify(config)
  })

  test('no-empty using simple config ', () => {
    const config = `
    mergeable:
      pull_requests:
        description:
          no-empty: true
    `

    verify(config)
  })

  test('no-empty using advanced config ', () => {
    const config = `
    mergeable:
      pull_requests:
        description:
          no-empty:
            enabled: true
    `
    verify(config)
  })
}) // END: Description no empty scenarios transformations

describe('Stale scenarios', () => {
  const loadWith = (moreConfig = '', expectedLength = 0) => {
    const config = `
    mergeable:
      pull_requests:
        title: 'wip'
    ${moreConfig}
    `

    const res = v1Config.transform(yaml.safeLoad(config))
    const whenSchedule = res.mergeable.filter(recipe => recipe.when === 'schedule.repository')
    expect(whenSchedule.length).toBe(expectedLength)
    return whenSchedule
  }

  test('No stale configuration', () => {
    loadWith()
  })

  test('Configuration in pulls only.', () => {
    const whenSchedule = loadWith(`
        stale:
          days: 20
          message: 'This is issue is stale. Please follow up!'
    `, 1)
    expect(whenSchedule[0].validate[0].type).toBe('pull_request')
    expect(whenSchedule.length).toBe(1)
  })

  test('Configuration in issues only', () => {
    const whenSchedule = loadWith(`
      issues:
        stale:
          days: 20
          message: 'This is issue is stale. Please follow up!'
    `, 1)

    expect(whenSchedule[0].validate[0].type).toBe('issues')
    expect(whenSchedule.length).toBe(1)
  })

  test('Configuration in both pull and issues', () => {
    const whenSchedule = loadWith(`
        stale:
          days: 20
      issues:
        stale:
          days: 20
          message: 'This is issue is stale. Please follow up!'
    `, 2)

    expect(whenSchedule[0].validate[0].type).toBe('issues')
    expect(whenSchedule[1].validate[0].type).toBe('pull_request')
  })
})

test('check that proper format is returned, including default pass, fail and error', async () => {
  const config = `
  mergeable:
    pull_requests:
      title: 'wip'
  `
  const res = v1Config.transform(yaml.safeLoad(config))
  expect(res.mergeable[0].when).toBeDefined()
  expect(res.mergeable[0].pass).toBeDefined()
  expect(res.mergeable[0].fail).toBeDefined()
  expect(res.mergeable[0].error).toBeDefined()
})

test('checks that the content is tranformed correctly', async () => {
  const config = `
  mergeable:
    pull_requests:
      title: 'wip'
  `
  const res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable[0].validate

  expect(validate[0].do).toBe('title')
  expect(validate[0].must_exclude).toBeDefined()
  expect(validate[0].must_exclude.regex).toBeDefined()
  expect(validate[0].must_exclude.regex).toBe('wip')
})

test('check all the simple config is transformed accurately', async () => {
  const config = `
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
  const res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable
  expect(validate.length).toBe(3)
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
          owners: true | false # will read the file .github/CODEOWNERS and make them required reviewers
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

      stale:
        # number of days for an issue to be considered stale. A comment is posted when it is stale.
        days: 20
        # Optional property. When not specified the default is used. The default message is used.
        message: 'This is issue is stale. Please follow up!'

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
  const res = v1Config.transform(yaml.safeLoad(config))
  const events = res.mergeable

  expect(events.length).toBe(5)
  const issues = (events.filter(item => item.when.includes('issues')))[0].validate
  const pr = (events.filter(item => item.when.includes('pull_request')))[0].validate
  const schedule = (events.filter(item => item.when.includes('schedule')))

  expect(issues.length).toBe(4)
  expect(issues[0].do).toBe('title')
  expect(issues[0].ends_with).toBeDefined()
  expect(issues[0].ends_with.match).toBe('(feat)|(doc)|(fix)')
  expect(issues[1].do).toBe('label')
  expect(issues[1].begins_with).toBeDefined()
  expect(issues[1].begins_with.match).toBe('(feat)|(doc)|(fix)')
  expect(issues[2].do).toBe('milestone')
  expect(issues[2].must_include).toBeDefined()
  expect(issues[2].must_include.regex).toBe('Release 1')
  expect(issues[3].do).toBe('project')
  expect(issues[3].must_exclude).toBeDefined()
  expect(issues[3].must_exclude.regex).toBe('jibberish')
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
  expect(schedule.length).toBe(2)
  expect(schedule[0].validate.length).toBe(1)
  expect(schedule[0].validate[0].do).toBe('stale')
  expect(schedule[0].validate[0].days).toBe(20)
  expect(schedule[0].validate[0].type).toBe('issues')
  expect(schedule[0].pass[0].payload.body).toBe('This is issue is stale. Please follow up!')
  expect(schedule[1].validate[0].do).toBe('stale')
  expect(schedule[1].validate[0].days).toBe(20)
  expect(schedule[1].validate[0].type).toBe('pull_request')
  expect(schedule[1].pass[0].payload.body).toBe('This is issue is stale. Please follow up!')
})

test('check that and/or logic is transformed correctly', async () => {
  const config = `
  mergeable:
    label:
      or:
        - and:
          - must_include:
              regex: 'release note: yes'
              message: 'Please include release note: yes'
          - must_include:
              regex: 'lang\\\\/core|lang\\\\/c\\\\+\\\\+|lang\\\\/c#'
              message: 'Please include a language label'
        - must_include:
            regex: 'release note: no'
            message: 'Please include release note: no'
  `
  const res = v1Config.transform(yaml.safeLoad(config))
  const validate = res.mergeable
  expect(validate.length).toBe(2)
  const pr = (validate.filter(item => item.when.includes('pull_request')))[0].validate

  expect(pr.length).toBe(1)
  expect(pr[0].do).toBe('label')
  expect(pr[0].or).toBeDefined()
  expect(pr[0].or.length).toBe(2)
  expect(pr[0].or[0].and).toBeDefined()
  expect(pr[0].or[0].and.length).toBe(2)
  expect(pr[0].or[0].and[0].must_include).toBeDefined()
  expect(pr[0].or[0].and[0].must_include.regex).toBe('release note: yes')
  expect(pr[0].or[0].and[0].must_include.message).toBe('Please include release note: yes')
  expect(pr[0].or[0].and[1].must_include).toBeDefined()
  expect(pr[0].or[0].and[1].must_include.regex).toBe('lang\\\\/core|lang\\\\/c\\\\+\\\\+|lang\\\\/c#')
  expect(pr[0].or[1].must_include).toBeDefined()
  expect(pr[0].or[1].must_include.regex).toBe('release note: no')
})
