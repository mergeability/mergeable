Comment
^^^^^^^^

::

    - do: comment
      payload:
        body: >
          Your very long comment can go here.
      old_comment: 'delete' # delete by default, if you wish to leave the old comments use 'leave'

Supported Events:
::

    'schedule.repository', 'pull_request.*', 'issues.*'
