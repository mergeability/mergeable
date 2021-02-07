EndsWith
^^^^^^^^

``ends_with`` can be used to validate inputs if end with given string

::

    - do: milestone
      ends_with:
         match: 'A String' # array of strings
         message: 'Some message...'

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - match
     - message to validate input with
     - Yes
     - 
   * - message
     - Message to show if the validation fails
     - No
     - [INPUT NAME] must ends with [MATCH]

Supported Validators:
::

    'changeset', 'content', 'description', 'label', 'milestone', 'title'
