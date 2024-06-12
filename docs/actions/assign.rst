Assign
^^^^^^^^

You can assign specific people to a pull request or issue.

::

    - do: assign
      assignees: [ 'shine2lay', 'jusx', '@author' ] # only array accepted, use @author for PR/Issue author

Supported Events:
::

    'pull_request.*', 'issues.*', 'issue_comment.*'