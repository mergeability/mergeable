Merge
^^^^^^^^

::

    - do: merge
      merge_method: 'merge' # Optional , default is 'merge'. Other options : 'rebase', 'squash'

.. warning::
    ``merge`` action will not work currently as it require ``contents`` ``read:write`` permission which the mergeable doesn't have. We have plans to enable it in the near future

Supported Events:
::

    'pull_request.*'
