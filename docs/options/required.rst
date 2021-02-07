Required
^^^^^^^^

``required`` can be used to validate if input meets the conditions given with params

::

    - do: approvals
      required:
        reviewers: [ user1, user2 ] # list of github usernames required to review
        owners: true # Optional boolean. When true, the file .github/CODEOWNERS is read and owners made required reviewers
        assignees: true # Optional boolean. When true, PR assignees are made required reviewers.
        requested_reviewers: true # Optional boolean. When true, all the requested reviewer's approval is required
        message: 'Custom message...'

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - reviewers
     - An array value for github users/teams to be required to do the validation
     - No
     - []
   * - owners
     - The file .github/CODEOWNERS is read and owners made required reviewers
     - No
     - []
   * - assignees
     - PR assignees are made required reviewers.
     - No
     - []
   * - requested_reviewers
     - All the requested reviewer's approval is required
     - No
     - []
   * - message
     - Message to show if the validation fails
     - No
     - [INPUT NAME] does not include [REGEX]

Supported Validators:
::

    'approvals'
