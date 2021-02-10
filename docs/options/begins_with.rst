BeginsWith
^^^^^^^^^^

``begins_with`` can be used to validate inputs if begin with given string

::

    - do: milestone
      begins_with:
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
     - [INPUT NAME] must begins with [MATCH]

Supported Validators:
::

    'changeset', 'content', 'description', 'label', 'milestone', 'title'
