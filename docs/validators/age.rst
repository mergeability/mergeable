Age
^^^^^^^^^^^^^^

::

    - do: age // validate based on the age of PR
      created_at:
        days: 1
        message: 'PR needs to at least 1 day old in order to merge' # optional, custom message to display if the validation fails
      updated_at:
        days: 1
        message: 'PR needs to be update free for 1 day before merging' # optional, custom message to display if the validation fails

Supported Events:
::

    'pull_request.*', 'pull_request_review.*',
