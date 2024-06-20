Assign
^^^^^^^^

You can assign specific people to a pull request or issue.

::

    - do: assign
      assignees: [ 'shine2lay', 'jusx', '@author' ] # only array accepted, use @author for PR/Issue author, use @sender for event initiator, use @bot for Mergable bot

Supported Events:
::

    'pull_request.*', 'issues.*', 'issue_comment.*'