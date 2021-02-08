Max
^^^

``max`` can be used to validate inputs length that is no more than given integer.

::

    - do: assignee
      max:
        count: 2 # There should not be more than 2 assignees
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
     - [INPUT NAME] count is more than [COUNT]

Supported Validators:
::

    'approvals', 'assignee', 'changeset', 'label'
