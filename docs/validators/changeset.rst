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
      files:
         added: true
         modified: false # setting to false is optional
         deleted: true
      # all of the message sub-option is optional

you can use ``and`` and ``or`` options to create more complex validations

::

    - do: changeset # validate against the files in the PR
      and:
        - must_include:
            regex: 'doc/.*'
            message: 'Custom message...'
        - must_include:
            regex: 'changelog.md'
            message: 'Custom message...'
      or:
        - must_include:
            regex: 'package-lock.json'
            message: 'Custom message...'
        - must_include:
            regex: 'yarn.lock'
            message: 'Custom message...'

you can also nest ``and`` and ``or`` options

::

    - do: changeset # validate against the files in the PR
      and:
        - or:
          - must_include:
              regex: 'package-lock.json'
              message: 'Custom message...'
          - must_include:
              regex: 'package.json'
              message: 'Custom message...'
        - must_include:
            regex: 'yarn.lock'
            message: 'Custom message...'


Supported Events:
::

    'pull_request.*', 'pull_request_review.*'