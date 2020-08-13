Label
^^^^^^^^^^^^^^

::

    - do: label
      no_empty:
         enabled: false # Cannot be empty when true.
         message: 'Custom message...'
      must_include:
         regex: 'type|chore|wont'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      must_exclude:
         regex: 'DO NOT MERGE'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      begins_with:
         match: 'A String' # or array of strings
         message: 'Some message...'
      ends_with:
         match: 'A String' # or array of strings
         message: 'Come message...'
      # all of the message sub-option is optional

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'