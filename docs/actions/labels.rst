Labels
^^^^^^^^

You can add, remove, and delete labels with one action.

.. warning::
    Using multiple ``do: labels`` in the same operation is not idempotent.
    Use only one ``labels`` action per block for accurate labeling.

You can add new labels, preserving existing ones

::

    - do: labels
      add: 'Ready for Review'

You can delete existing labels

::

    - do: labels
      delete: [ 'Ready for Review', 'Triage' ]

You can replace all current labels with new ones

::

    - do: labels
      replace: [ 'Triage', 'Needs Deploy' ]

You can also use any combination of these options. They can be listed in any
order, but the action is always evaluated in the order of ``replace`` → ``add``
→ ``delete``.

::

    - do: labels
      replace: [ 'New Task', 'Not Useful' ]
      add: [ 'Work in Progress', 'Needs Deploy' ]
      delete: 'Not Useful'

    # result: [ 'New Task', 'Work in Progress', 'Needs Deploy' ]


``labels`` and ``mode``
"""""""""""""""""""""""

.. warning::
    Using ``labels`` with ``mode`` is deprecated and will be removed in v3.
    Use the ``add``, ``replace``, and ``delete`` options above for labeling.

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

    'schedule.repository', 'pull_request.*', 'issues.*', 'issue_comment.*'
