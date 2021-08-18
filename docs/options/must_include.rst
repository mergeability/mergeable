MustInclude
^^^^^^^^^^^

``must_include`` can be used to validate input that includes the given regex supported message.

::

    - do: headRef
      must_include:
        regex: '^(feature|hotfix)\/.+$'
        message: |
            Your pull request doesn't adhere to the branch naming convention described <a href="some link">there</a>!k

You can also use an array of regex matchers. If any of them match, the validation will pass.

::

    - do: headRef
      must_include:
        regex:
          - "^feature"
          - "^hotfix"
          - "^fix"
        message: |
            Your pull request doesn't adhere to the branch naming convention described <a href="some link">there</a>!k

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - regex
     - Regex or array enabled message to validate input with
     - Yes
     -
   * - message
     - Message to show if the validation fails
     - No
     - [INPUT NAME] does not include [REGEX]
   * - regex_flag
     - Regex flag to be used with regex param to validate inputs
     - No
     - i

Supported Validators:-
::

    'baseRef', 'headRef', 'changeset', 'commit', 'content', 'description', 'label', 'milestone', 'project', 'title'
