Min
^^^

``min`` can be used to validate inputs length that isn't less than given integer.

::

    - do: assignee
      min:
        count: 2 # There should be more than 2 assignees
        message: 'test string' # this is optional

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - count
     - number to validate input's length
     - Yes
     - 
   * - message
     - Message to show if the validation fails
     - No
     - [INPUT NAME] count is less than [COUNT]

Supported Validators:
::

    'approvals', 'assignee', 'changeset', 'label', 'size'
