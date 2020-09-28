label
^^^^^^^^

You can also add a set of the labels on an item

::

    - do: labels
      # if label doesn't exist, it'll be created
      labels: [ 'Triage' ] # Only arrays are accepted
      mode: 'add' # Optional , default is 'add'. Other options : 'replace', 'delete'


You can also replace all of the labels on an item with a given set of labels

::

    - do: labels
      # if label doesn't exist, it'll be created
      labels: [ 'Triage' ] # Only arrays are accepted
      mode: 'replace' # Replaces all of the labels with the above array of labels


You can also delete existing labels on an item and specify glob patterns when the mode is `delete`.

::

    - do: labels
      # if label doesn't exist, it'll be created
      labels: [ 'feature-*' ] # All labels beginning with 'feature-' will be removed
      mode: 'delete'

Note that the glob functionality is powered by the minimatch library. Please see their documentation for details on how glob patterns are handled and possible discrepancies with glob handling in other tools.

Supported Events:
::

    'schedule.repository', 'pull_request.*', 'issues.*'
