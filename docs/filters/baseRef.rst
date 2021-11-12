BaseRef
^^^^^^^^^^^^^^

::

      - do: baseRef
        must_include:
            regex: 'some-ref'
            message: 'Custom message...'
        # all of the message sub-option is optional

you can use ``and`` and ``or`` options to create more complex filters

::

    - do: baseRef
      and:
        - must_exclude:
            regex: 'some-other-ref'
            message: 'Custom message...'
      or:
        - must_include:
            regex: 'some-ref'
            message: 'Custom message...'
        - must_include:
            regex: 'some-other-ref'
            message: 'Custom message...'

you can also nest ``and`` and ``or`` options

::

    - do: baseRef
      and:
        - or:
            - must_include:
                regex: 'some-ref'
                message: 'Custom message...'
            - must_include:
                regex: 'some-other-ref'
                message: 'Custom message...'
        - must_exclude:
            regex: 'yet-another-ref'
            message: 'Custom message...'

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
