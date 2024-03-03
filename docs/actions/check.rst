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
        summary: "All the validators have returned 'pass'! \n Here are some stats of the run: \n {{validationCount}} validations were run"

You can pass in Handlebars template to show the details result of the run.

::

    - do: checks # default fail case
      status: 'failure' # Can be: success, failure, neutral, cancelled, timed_out, or action_required
      payload:
        title: 'Mergeable Run have been Completed!'
        summary: |
             ### Status: {{toUpperCase validationStatus}}
                  Here are some stats of the run:
                  {{validationCount}} validations were run.
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
            Here are some stats of the run: \n {{validationCount}} validations were run.
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

.. note::
    checks will automatically re-run if the base branch has a modified config file

Supported Events:

The `pull_request.closed` event is not supported since it does not have meaningful use in the context of GitHub check API.

::

    'pull_request.assigned', 'pull_request.auto_merge_disabled', 'pull_request.auto_merge_enabled', 'pull_request.converted_to_draft', 'pull_request.demilestoned', 'pull_request.dequeued', 'pull_request.edited', 'pull_request.enqueued', 'pull_request.labeled', 'pull_request.locked', 'pull_request.milestoned', 'pull_request.opened', 'pull_request.push_synchronize', 'pull_request.ready_for_review', 'pull_request.reopened', 'pull_request.review_request_removed', 'pull_request.review_requested', 'pull_request.synchronize', 'pull_request.unassigned', 'pull_request.unlabeled', 'pull_request.unlocked', 'pull_request_review.dismissed', 'pull_request_review.edited', 'pull_request_review.submitted'
