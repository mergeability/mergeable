Time
^^^^^^^^^^^^^^

::

    - do: time
      age:  // validate based on the age of the PR
        seconds: 86400
        use_updated_at: false # optional, default = false. use updated_at value instead of created_at
        message: 'PR needs to at least 1 day old in order to merge' # optional, custom message to display if the validation fails

Supported Events:
::

    'pull_request.*', 'pull_request_review.*',
