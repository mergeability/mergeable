Description
^^^^^^^^^^^^^^

::

    - do: commit
      message:
        regex: '^(feat|docs|chore|fix|refactor|test|style|perf)(\(\w+\))?:.+$'
        message: 'Custom message' # Semantic release conventions must be followed
        skip_merge: true # Optional, Default is true. Will skip commit with message that includes 'Merge'
        oldest_only: false # Optional, Default is false. Only check the regex against the oldest commit
        single_commit_only: false # Optional, Default is false. only process this validator if there is one commit

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'