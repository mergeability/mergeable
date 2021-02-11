Repository
^^^^^^^^^^^^^^

::

      - do: repository
        visibility: 'public' # Can be public or private
        topics:
          must_include:
            regex: 'my-topic'
            message: 'Custom message...'
          must_exclude:
            regex: 'other-topic'
            message: 'Custom message...'
          # all of the message sub-option is optional

you can use ``and`` and ``or`` options to create more complex validations

::

      - do: repository
        topics:
          and:
            - must_include:
                regex: 'topic-1'
                message: 'Custom message...'
            - must_include:
                regex: 'topic-2'
                message: 'Custom message...'
          or:
            - must_include:
                regex: 'topic-3'
                message: 'Custom message...'
            - must_include:
                regex: 'topic-4'
                message: 'Custom message...'

you can also nest ``and`` and ``or`` options

::

      - do: repository
        topics:
          and:
            - or:
                - must_include:
                    regex: 'topic-1'
                    message: 'Custom message...'
                - must_include:
                    regex: 'topic-2'
                    message: 'Custom message...'
            - must_include:
                regex: 'topic-3'
                message: 'Custom message...'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
