Author
^^^^^^^^^^^^^^

::

      - do: author
        must_include:
            regex: 'user-1'
            message: 'Custom include message...'  # optional
        must_exclude:
            regex: 'user-2'
            message: 'Custom exclude message...'  # optional
        team: 'org/team-slug'  # verify that the author is in the team
        one_of: ['user-1', '@org/team-slug']  # verify author for being one of the users or a team member
        none_of: ['user-2', '@bot']  # verify author for not being one of the users or the mergeable bot

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
