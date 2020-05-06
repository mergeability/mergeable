Project
^^^^^^^^^^^^^^

::

    - do: project
      must_include:
         regex: 'type|chore|wont'
         message: 'Custom message...'

.. note::
    When a closing keyword is used in the description of a pull request. The annotated issue will be validated against the conditions as well.

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'