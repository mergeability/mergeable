module.exports = {
  CONFIGURATION_FILE_PATH: '.github/mergeable.yml',
  ERROR_INVALID_YML: 'Invalid mergeable YML file format. Root mergeable node is missing.',
  DEFAULT_PR_PASS: [{
    do: 'checks',
    state: 'completed',
    status: 'success',
    payload: {
      title: 'Mergeable Run has been Completed!',
      summary: 'All the validators have returned \'pass\'! \n Here are some stats of the run: \n {{validationCount}} validations were run'
    }
  }],
  DEFAULT_PR_FAIL: [{
    do: 'checks',
    state: 'completed',
    status: 'failure',
    payload: {
      title: '{{failCount}}/{{validationCount}} Fail(s): {{#each failures}} {{toUpperCase name}}{{^@last}}, {{/@last}}{{/each}}',
      summary: `### Status: {{toUpperCase validationStatus}}

        Here are some stats of the run:
        {{validationCount}} validations were run.
        {{passCount}} PASSED
        {{failCount}} FAILED
      `,
      text: `{{#each validationSuites}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
       Input : {{{details.input}}}
       Settings : {{{displaySettings details.settings}}}
       {{/each}}
{{/each}}`
    }
  }],
  DEFAULT_PR_ERROR: [{
    do: 'checks',
    state: 'completed',
    status: 'action_required',
    payload: {
      title: 'Mergeable found some failed checks!',
      summary: `### Status: {{toUpperCase validationStatus}}
      Some or All of the validators have returned 'error' status, please check below for details
      
      Here are some stats of the run: 
      {{validationCount}} validations were run. 
      {{passCount}} ***PASSED***
      {{failCount}} ***FAILED***
      {{errorCount}} ***ERRORED***`,
      text: `{{#each validationSuites}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
Status {{toUpperCase status}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
       Input : {{{details.input}}}
       Settings : {{{displaySettings details.settings}}}
       {{#if details.error}}
       Error : {{{details.error}}}
       {{/if}}
       {{/each}}
{{/each}}`
    }
  }],
  DEFAULT_ISSUES_PASS: [{
    do: 'comment',
    payload: {
      body: 'All the validators have returned \'pass\'! \n Here are some stats of the run: \n {{validationCount}} validations were run'
    }
  }],
  DEFAULT_ISSUES_FAIL: [{
    do: 'comment',
    payload: {
      body: `### We found some failed validations in your Issue
{{#each validationSuites}}
{{#ifEquals status "fail"}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
Input : {{{details.input}}}
Settings : {{{displaySettings details.settings}}}
{{/each}}
{{/ifEquals}}
{{/each}}`
    }
  }],
  DEFAULT_ISSUES_ERROR: [{
    do: 'comment',
    payload: {
      body: `### We found some error in your mergeable configuration
{{#each validationSuites}}
{{#ifEquals status "error"}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
Input : {{{details.input}}}
Settings : {{{displaySettings details.settings}}}
{{#if details.error}}
Error : {{{details.error}}}
{{/if}}
{{/each}}
{{/ifEquals}}
{{/each}}
        `
    }
  }],
  DEFAULT_PR_VALIDATE: [{
    do: 'title',
    must_exclude: {
      regex: '^wip'
    }
  }, {
    do: 'label',
    must_exclude: {
      regex: 'work in progress|wip|do not merge'
    }
  }, {
    do: 'description',
    no_empty: {
      enabled: true
    }
  }]
}
