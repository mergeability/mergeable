NoEmpty
^^^^^^^

``no_empty`` can be used to validate if input is not empty

::

    - do: description
      no_empty:
         enabled: false # Cannot be empty when true.
         message: 'Custom message...' # this is optional, a default message is used when not specified.

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - enabled
     - Bool value to enable/disable the option
     - Yes
     - 
   * - message
     - Message to show if the validation fails
     - No
     - The [INPUT NAME] can't be empty

Supported Validators:
::

    'changeset', 'description', 'label', 'milestone', 'title'
