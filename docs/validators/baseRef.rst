BaseRef
^^^^^^^^^^^^^^

::

    - do: baseRef
      must_include:
         regex: 'master|feature-branch1'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      must_exclude:
         regex: 'feature-branch2'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'


Simple example:
::

    - do: baseRef
      must_exclude:
        regex: 'master'
        message: 'Merging into repo:master is forbidden'


Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
