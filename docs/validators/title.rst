Project
^^^^^^^^^^^^^^

::

    - do: title
      no_empty:
         enabled: true # Cannot be empty when true. A bit redundant in this case since GitHub don't really allow it. :-)
         message: 'Custom message...'
      must_include:
         regex: 'doc|feat|fix|chore'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      must_exclude:
         regex: 'DO NOT MERGE|WIP'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      begins_with:
         match: ['doc','feat','fix','chore']
         message: 'Some message...'
      ends_with:
         match: 'A String' # or array of strings
         message: 'Come message...'
         # all of the message sub-option is optional


Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'