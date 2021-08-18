Merge
^^^^^^^^

::

    - do: merge
      merge_method: 'merge' # Optional , default is 'merge'. Other options : 'rebase', 'squash'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'status.*', 'check_suite.*'
