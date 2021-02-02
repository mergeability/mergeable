Milestone
^^^^^^^^^^^^^^

::

    - do: milestone
      no_empty:
         enabled: true # Cannot be empty when true.
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
         match: 'A String' # array of strings
         message: 'Some message...'
      ends_with:
         match: 'A String' # array list of strings
         message: 'Come message...'
      jira:
        regex: '[A-Z][A-Z0-9]+-\d+'
        regex_flag: none
        message: 'The Jira ticket does not exist'
      # all of the message sub-option is optional

::

    - do: milestone
      and:
        - must_include:
            regex: 'V1'
            message: 'Custom message...'
        - must_include:
            regex: 'October'
            message: 'Custom message...'
      or:
        - must_include:
            regex: 'V2'
            message: 'Custom message...'
        - must_include:
            regex: 'Non breaking Changes'
            message: 'Custom message...'

you can also nest ``and`` and ``or`` options

::

    - do: milestone
      and:
        - or:
          - must_include:
              regex: 'V1'
              message: 'Custom message...'
          - must_include:
              regex: 'September'
              message: 'Custom message...'
        - must_include:
            regex: 'V2'
            message: 'Custom message...'


.. note::
    When a closing keyword is used in the description of a pull request. The annotated issue will be validated against the conditions as well.

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'