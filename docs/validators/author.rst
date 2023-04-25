Author
^^^^^^^^^^^^^^

::

      - do: author
        must_include:
            regex: 'user-1'
            message: 'Custom include message...'
        must_exclude:
            regex: 'user-2'
            message: 'Custom exclude message...'
        team: 'org/team-slug'  # verify that the author is in the team
        # all of the message sub-option is optional

you can use ``and`` and ``or`` options to create more complex filters

::

    - do: author
      and:
        - must_exclude:
            regex: 'bot-user-1'
            message: 'Custom message...'
      or:
        - must_include:
            regex: 'user-1'
            message: 'Custom message...'
        - must_include:
            regex: 'user-2'
            message: 'Custom message...'

you can also nest ``and`` and ``or`` options

::

    - do: author
      and:
        - or:
            - must_include:
                regex: 'user-1'
                message: 'Custom message...'
            - must_include:
                regex: 'user-2'
                message: 'Custom message...'
        - must_exclude:
            regex: 'bot-user-1'
            message: 'Custom message...'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
