Comment
^^^^^^^^

You can add a comment to a pull request or issue.

::

    - do: comment
      payload:
        body: >
          Your very long comment can go here.
      leave_old_comment: true # Optional, by default old comments are deleted, if true, old comments will be left alone

Supported Events:
::

    'schedule.repository', 'pull_request.*', 'issues.*', 'issue_comment.*'
