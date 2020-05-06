Description
^^^^^^^^^^^^^^

::

    - do: description
      no_empty:
         enabled: false # Cannot be empty when true.
         message: 'Custom message...' # this is optional, a default message is used when not specified.
      must_include:
         regex: '### Goals|### Changes'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: >
          Please describe the goals (why) and changes (what) of the PR.
        # message is is optional, a default message is used when not specified.
      must_exclude:
         regex: 'DO NOT MERGE'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...' # optional
      begins_with:
         match: '### Goals' # or array of strings
         message: 'Some message...' #optional
      ends_with:
         match: 'Any last sentence' # array of strings
         message: 'Come message...' # optional

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'