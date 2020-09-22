Remove labels
^^^^^^^^^^^^^

::

    - do: remove_labels
      # if label exists, it'll be deleted
      labels: [ 'Triage' ] # Only arrays are accepted

Supported Events:
::

    'schedule.repository', 'pull_request.*', 'issues.*'
