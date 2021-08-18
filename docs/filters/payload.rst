Payload
^^^^^^^^^^^^^^

Check against any available fields within the payload, each event can have different field, please refer to `github API documentation for<https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads>`_ available fields.

An example to check if a pull_request_review event has `state` of `changes_requested`

.. codeblock:: yml

      - do: payload
        review:
          state:
            must_include:
              regex: 'changes_requested'


Each field must be checked using one of the following options

.. codeblock:: yml

      must_include:
        regex: 'This text must be included'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'
      must_exclude:
        regex: 'Text to exclude'
        regex_flag: 'none' # Optional. Specify the flag for Regex. default is 'i', to disable default use 'none'


Supported Events:
::

    'pull_request.*', 'pull_request_review.*', issues.*'
