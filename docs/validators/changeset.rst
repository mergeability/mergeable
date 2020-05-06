Change set
^^^^^^^^^^^^^^

::

    - do: changeset # validate against the files in the PR
      no_empty:
         enabled: false # Cannot be empty when true.
         message: 'Custom message...'
      must_include:
         regex: 'yarn.lock'
         message: 'Custom message...'
      must_exclude:
         regex: 'package.json'
         message: 'Custom message...'
      begins_with:
         match: 'A String' # or array of strings
         message: 'Some message...'
      ends_with:
         match: 'A String' # or array of strings
         message: 'Come message...'
      min:
          count: 2 # min number of files in a PR
          message: 'Custom message...'
      max:
         count: 2 # max number of files in a PR
         message: 'Custom message...'
      # all of the message sub-option is optional

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'