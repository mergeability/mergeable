Jira
^^^^

``jira`` can be used to validate inputs string in Atlassian Jira with APIs

.. note::
    This option work in self-hosted version only.

.. list-table:: Required Environment Variables
   :widths: 25 50 25 25
   :header-rows: 1

   * - Env
     - Description
     - Required
     - Default
   * - JIRA_PASSWORD
     - Password to authenticate with JIRA
     - Yes
     - 
   * - JIRA_USERNAME
     - Username to authenticate with JIRA
     - Yes
     -
   * - JIRA_HOST
     - Host to authenticate with JIRA
     - yes
     - 
   * - JIRA_PROTOCOL
     - Protocol to establish connection with JIRA
     - no
     - https
   * - JIRA_VERSION
     - JIRA API Version to use
     - no
     - 2
   * - JIRA_STRICT_SSL
     - Force SSL while establishing connection
     - no
     - yes

::

    - do: headRef
        jira:
          regex: '[A-Z][A-Z0-9]+-\d+'
          regex_flag: none
          message: 'The Jira ticket does not valid'

.. list-table:: Supported Params
   :widths: 25 50 25 25
   :header-rows: 1

   * - Param
     - Description
     - Required
     - Default Message
   * - regex
     - Regex enabled message to validate input with
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

Supported Validators:
::

    'commit', 'description', 'headRef', 'label', 'milestone', 'title'
