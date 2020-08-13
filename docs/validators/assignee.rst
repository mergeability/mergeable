Assignee
^^^^^^^^^^

::

    - do: assignee
      max:
        count: 2 # There should not be more than 2 assignees
        message: 'test string' # this is optional
      min:
        count: 2 # min number of assignees
        message: 'test string' # this is optional

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'

