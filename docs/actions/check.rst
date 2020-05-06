Check
^^^^^^^^

.. note::
    Some default cases do exists for pass, fail and error cases if you don't provide them when the event include ``pull_request.*``.
    If you provide these cases, the defaults will be overwritten

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

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'