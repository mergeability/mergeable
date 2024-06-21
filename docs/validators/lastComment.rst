LastComment
^^^^^^^^^^^
Validates that the newly created comment contains or excludes given text. When an existing comment is edited, then exactly this one is validated instead.

::

    - do: lastComment
      must_include:
        regex: '/sign'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
        message: 'Contributor Agreement signed...'
      must_exclude:
        regex: 'incompliant'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
        message: 'Violates compliance...'
      comment_author:
        one_of: ['user-1', '@author'] # when the option is present, ONLY comments from users in this list will be considered, use @author for PR/Issue author
        none_of: ['user-2', '@author'] # when the option is present, comments from users in this list will NOT be considered, use @author for PR/Issue author
        no_bots: true # by default comments from any bots will NOT be considered, set to false to exclude only specific bots explicitly in 'comment_author' option

Simple example:
::

    # check if the last comment contains only the word 'merge'
    - do: lastComment
      must_include:
        regex: '^merge$'

Complex example:
::

    # check if the last comment, not posted by PR/Issue author, meets one of these conditions 
    # it might have been posted by a bot, except Mergeble itself
    - do: lastComment
      comment_author:
        none_of: ['Mergeable[bot]', '@author']
        no_bots: false
      or:
        - and:
          - must_exclude:
              regex: 'block|wip|stale'
              message: 'pre-requisites are not fulfilled...'
          - must_include:
              regex: 'agreed|confirmed|compliant'
              message: 'pre-requisites are fulfilled...'
        - must_include:
            regex: '^/override$'
            message: 'skip pre-requisite check...'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*', 'issue_comment.*'
