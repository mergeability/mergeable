Payload
^^^^^^^^^^^^^^

Check against any available fields within the payload, each event can have different field, please refer to `github API documentation <https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads>`_ for available fields.

An example to check if a `pull_request_review` event has ``state`` of `changes_requested`

::

      - do: payload
        review:
          state:
            must_include:
              regex: 'changes_requested'

To check if a `pull_request` event is not a `draft`

::

      - do: payload
        pull_request:
          draft:
            boolean:
              match: false

An example to check if a `pull_request` event has a ``label`` named `foo`

::

      - do: payload
        pull_request:
          labels:
            must_include:
              regex: 'foo'
              key: 'name'

An example to check whether the initiator of the event is part of a team but not excluded.

::

      - do: payload
        sender:
          login:
            one_of: ['@org/team-slug']
            none_of: ['banned_user', '@author', '@bot']


Each field must be checked using one of the following options

::

      boolean:
        match: true/false
      must_include:
        regex: 'This text must be included'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
        key: 'name' # Optional. If checking an array of objects, this specifies the key to check.
      must_exclude:
        regex: 'Text to exclude'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
        key: 'name' # Optional. If checking an array of objects, this specifies the key to check.
      one_of: ['user-1', 'user-2'] # Compares the field value for occurance in the list of strings, case-insensitive, annotations supported
      none_of: ['@author', '@bot'] # Compares the field value for absence in the list of strings, case-insensitive, annotations supported


Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*', 'issue_comment.*'
