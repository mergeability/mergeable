## Work In Progress

Prevent accidental merging of Pull Requests that are work in progress by labeling it `WIP` or prefixing the title with the abbreviation.

### Recipe
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

### Why
With this recipe, mergeable will fail the pull request when the terms `wip` or `work in progress` is found in the title or label.
