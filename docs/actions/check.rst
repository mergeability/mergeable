Check
^^^^^^^^

.. note::
    The logic for whether checks will be added by default is as follows:
    1. If no action is provided in either pass, fail or error , add `checks` as default (to be backward compatible)
    2. If only actions other than `checks` is provided, don't add check as default (to support cases where checks are not wanted)
    3. If checks is a part of the actions provided, all pass , fail and error cases will have `checks` (to prevent case where a check is hanged and never finish processing)

::

    - do: checks # default pass case
      status: 'success' # Can be: success, failure, neutral, cancelled, timed_out, or action_required
      payload:
        title: 'Mergeable Run have been Completed!'
        summary: "All the validators have returned 'pass'! \n Here are some stats of the run: \n {{validationCount}} validations were ran"

You can pass in Handlebars template to show the details result of the run.

::

    - do: checks # default fail case
      status: 'failure' # Can be: success, failure, neutral, cancelled, timed_out, or action_required
      payload:
        title: 'Mergeable Run have been Completed!'
        summary: |
             ### Status: {{toUpperCase validationStatus}}
                  Here are some stats of the run:
                  {{validationCount}} validations were ran.
                  {{passCount}} PASSED
                  {{failCount}} FAILED
        text: "{{#each validationSuites}}\n
              #### {{{statusIcon status}}} Validator: {{toUpperCase name}}\n
              {{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***\n
                     Input : {{{details.input}}}\n
                     Settings : {{{displaySettings details.settings}}}\n
                     {{/each}}\n
              {{/each}}"

::

    - do: checks # default error case
      status: 'action_required' # Can be: success, failure, neutral, cancelled, timed_out, or action_required
      payload:
        title: 'Mergeable found some errors!'
        summary: |
            ### Status: {{toUpperCase validationStatus}}
            Some or All of the validators have returned 'error' status, please check below for details
            Here are some stats of the run: \n {{validationCount}} validations were ran.
            {{passCount}} ***PASSED***
            {{failCount}} ***FAILED***
            {{errorCount}} ***ERRORED***
        text: "{{#each validationSuites}}
            #### {{{statusIcon status}}} Validator: {{toUpperCase name}}
            Status {{toUpperCase status}}
            {{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
                   Input : {{{details.input}}}
                   Settings : {{{displaySettings details.settings}}}
                   {{#if details.error}}
                   Error : {{{details.error}}}
                   {{/if}}
                   {{/each}}
            {{/each}}"

.. note::
    if any of required fields ``title``, ``summary`` or ``status`` is missing, default values will be used

.. warning::
    if you have have ``checks`` action only for some of the outcome, you may end up in a state where checks are never finished.
    So be sure to have ``checks`` for all outcome (``pass``, ``fail``, and ``error``)

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'