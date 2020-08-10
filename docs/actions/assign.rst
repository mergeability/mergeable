Assign
^^^^^^^^

::

    - do: assign
      assignees: [ 'shine2lay', 'jusx', '@author' ] # only array accepted, use @author for PR/Issue author

Supported Events:
::

    'pull_request.*', 'issues.*'