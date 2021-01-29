HeadRef
^^^^^^^^^^^^^^

::

    - do: headRef
      must_include:
         regex: 'feature-branch1'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      must_exclude:
         regex: 'feature-branch2'
         regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
         message: 'Custom message...'
      jira:
        regex: '[A-Z][A-Z0-9]+-\d+'
        regex_flag: none
        message: 'The Jira ticket does not exist'


Simple example:
::

    - do: headRef
      must_include:
        regex: '^(feature|hotfix)\/.+$'
        message: |
            Your pull request doesn't adhere to the branch naming convention described <a href="some link">there</a>!k


Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
