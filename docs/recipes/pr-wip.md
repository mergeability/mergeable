## Preventing accidental merging of Pull Requests that are work in progress.

Some times a pull request is opened before work is complete so that others may comment on the code. When this is the case, you may want to make sure that you clearly mark the pull request as `WIP`.

You also want to make sure that the pull request is not accidentally merged.

Create a configuration with the following recipe:

```yml
version: 2
mergeable:
  - when: pull_request.*
    validate:
      - do: title
        must_exclude:
          regex: 'wip|work in progress'
      - do: label
        must_exclude:
          regex: 'wip|work in progress'
    pass:
      - do: checks
        status: success
        payload:
          title: Success!!
          summary: '{{#results}}- {{message.pass}} {{/results}}'
    fail:
      - do: checks
        status: failure
        payload:
          title: Fail!!
          summary: >
            The following errors have occured {{#results}}- {{message.fail}} {{/results}}
```

With this recipe, mergeable will fail the pull request when the terms `wip` or `work in progress` is found in the title or label.
