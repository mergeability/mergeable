Last Comment
^^^^^^^^^^

::

    - do: lastComment // check if the last comment contains only the word 'merge'
      must_include:
        regex: '^merge$'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*', 'issue_comment.*'

