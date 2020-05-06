Configuration of the rulesets can be done in two ways: Simple or advanced.

Here's an example file for simple settings:

```yml
##############################
# Example Simple Settings
#############################
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
    exclude: 'approvals, label'

  issues:
      # Regular expression. In this example, whenever a issues has a label with the word 'wip'
      label: 'wip|do not merge|experimental'
```

Here's an example configuration file for advanced settings and all of it's possible options:

```yml
  ##############################
  # example Advanced Settings
  ##############################
  mergeable:
    pull_requests:
      stale:
        # number of days for a PR to be considered stale. A comment is posted when it is stale.
        days: 20
        # Optional property. When not specified the default is used. The default message is:
        # There haven't been much activity here. This is stale. Is it still relevant? This is a friendly reminder to please resolve it. :-)
        message: 'This is PR is stale. Please follow up!'
      title:
        must_include:
          regex: `^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`
          message: `Title must have prefixes for the following: (feat), (doc), (fix)`
        must_exclude:
          regex: 'wip'
          message: 'This PR is work in progress.'
        begins_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Custom message...'
        ends_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Custom message...'

      label:
        must_include:
          regex: `^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`
          message: `Title must have prefixes for the following: (feat), (doc), (fix)`
        must_exclude:
          regex: 'wip'
          message: 'Custom message. This PR is work in progress.'
        begins_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Come message...'
        ends_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Come message...'  

      milestone:
        must_include:
          regex: `Release 1`
          message: `Custom message...`
        must_exclude:
          regex: 'jibberish'
          message: 'Custom message...'
        begins_with:
          match: 'Release'
          message: 'Custom message...'
        ends_with:
          match: ''
          message: 'Custom message...'

      project:
        must_include:
          regex: `Release 1`
          message: `Custom message...`
        must_exclude:
          regex: 'jibberish'
          message: 'Custom message...'
        begins_with:
          match: 'Release'
          message: 'Custom message...'
        ends_with:
          match: ''
          message: 'Custom message...'  

      approvals:
        min: 5
          message: 'Custom message...'
        required:
          reviewers: [ user1, user2 ]   # list of github usernames required to review
          owners: true | false # will read the file .github/CODEOWNER and make them required reviewers
          message: 'Custom message...'		

      description:
        no_empty:
          enabled: false
          message: 'Custom message...'
        must_include:
          regex: 'feat'
          message: 'Custom message...'
        must_exclude:
          regex: 'DO NOT MERGE'
          message: 'Custom message...'

      assignee:
        min: 1
        max: 1
        message: 'Custom message...'

      dependent:
        files: ['package.json', 'yarn.lock'] # list of files that all must be modified if one is modified
        message: 'Custom message...'

    #####
    #  Advanced settings for issues. When any of the rules  below is not valid Mergeable will create a comment on that issue to let the author know.    
    ###
    issues:
      stale:
        # number of days for an issue to be considered stale. A comment is posted when it is stale.  
        days: 20
        # Optional property. When not specified the default is used. The default message is used.
        message: 'This is issue is stale. Please follow up!'
      title:
        must_include:
          regex: `^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`
          message: `Title must have prefixes for the following: (feat), (doc), (fix)`
        must_exclude:
          regex: 'wip'
          message: 'This PR is work in progress.'
        begins_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Custom message...'
        ends_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Custom message...'

      label:
        must_include:
          regex: `^\\(feat\\)|^\\(doc\\)|^\\(fix\\)`
          message: `Title must have prefixes for the following: (feat), (doc), (fix)`
        must_exclude:
          regex: 'wip'
          message: 'Custom message. This PR is work in progress.'
        begins_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Come message...'
        ends_with:
          match: '(feat)|(doc)|(fix)'
          message: 'Come message...'  

      milestone:
        must_include:
          regex: `Release 1`
          message: `Custom message...`
        must_exclude:
          regex: 'jibberish'
          message: 'Custom message...'
        begins_with:
          match: 'Release'
          message: 'Custom message...'
        ends_with:
          match: ''
          message: 'Custom message...'  

      project:
        must_include:
          regex: `Release 1`
          message: `Custom message...`
        must_exclude:
          regex: 'jibberish'
          message: 'Custom message...'
        begins_with:
          match: 'Release'
          message: 'Custom message...'
        ends_with:
          match: ''
          message: 'Custom message...'

      description:
        no_empty:
          enabled: false
          message: 'Custom message...'
        must_include:
          regex: 'feat'
          message: 'Custom message...'
        must_exclude:
          regex: 'DO NOT MERGE'
          message: 'Custom message...'

      assignee:
        min: 1
        max: 1
        message: 'Custom message...'
```

By default if the configuration file does not exist, the following is the default settings out of the box:

```yml
  ####################
  # default settings
  ####################
  mergeable:
    pull_requests:
      label: 'work in progress|do not merge|experimental|proof of concept'
      title: 'wip|dnm|exp|poc'
      description:
        no-empty: true
```
The configuration file follows a certain format. It is in the general following structure:

```yml
mergeable:
  subject:
    topic:
      advanced_option (optional):
```

### Structure & Formating
The configuration file in general follows a structure. There is a hierarchy of `subject`, `topic`, and `advanced_option`.

Currently the list of `subjects` available are:
- pull_requests:
- issues:

A list of `topics` available for a simple configuration file are as follows:
- title: regex (must exlude)
- description: regex (must exclude)
- assignee: number (minimum number of assignees)
- labels: regex (must exclude)
- milestone: regex (must include)
- project: regex (must include)
- approvals: number (minimum number of assignee)
- exclude: [] (exclude any of the topic above)

A list of `advanced_option` for an advanced configuration file are as follows:
- must_include
   - regex
   - message
- must_exclude
   - regex
   - message
- begins_with
   - match
   - message
- ends_with
   - match
   - message
- min
   - count
   - message
- max
   - count
   - message
- no-empty
   - enabled
   - message
- required
   - reviewers
   - message

**Note**: Not all `advanced_option` works with all topics except project and milestone -- `sub_options` must be provided for each advanced options.
