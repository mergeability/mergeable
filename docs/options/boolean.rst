Boolean
^^^^^^^

``boolean`` can be used to validate if the input is exactly `true` or `false`. This does not pass truthy values.

For example, if the `pull_request.draft` value is `false`:

::

    {
      "action": "opened",
      "number": 2,
      "pull_request": {
        "draft": false

This will pass validation, because the value of `draft` exactly matches `false`:

::

    - do: payload
      pull_request:
        draft:
          boolean:
            match: false
            message: 'Custom message...' # this is optional, a default message is used when not specified.


.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - match
     - Bool value to check for
     - Yes
     -
   * - message
     - Message to show if the validation fails
     - No
     - The [INPUT NAME] must be [match]

Supported Filters:
::

    'payload'
