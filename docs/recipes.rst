.. _recipes-page:

Recipes
--------------------------

Work In Progress
"""""""""""""""""
Prevent accidental merging of Pull Requests that are work in progress by labeling it WIP or prefixing the title with the abbreviation.

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: title
            must_exclude:
              regex: ^\[WIP\]
          - do: label
            must_exclude:
              regex: 'wip'

No Empty Description
"""""""""""""""""
Ensure all Pull Requests have a description so that reviewers have context.

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: description
            no_empty:
              enabled: true
              message: Description matter and should not be empty. Provide detail with **what** was changed, **why** it was changed, and **how** it was changed.

Dependent Files
"""""""""""""""""""""
Certain files are related and you want to ensure that they are updated as part of the PR (i.e. if package.json is updated, so should yarn.lock and package-lock.json)

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: dependent
            changed:
              file: 'package.json'  # also supports globs expressions
              required: ['package-lock.json', 'yarn.lock'] # alias: `files` for backward compatibility

Must Include Milestone
""""""""""""""""""""""
Ensure that all Pull Requests have a milestone associated. Mergeable will also detect when you are `closing an issue<https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue>`_ that is associated with the specified milestone.

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: milestone
            must_include:
              regex: Release 1

Small PR Size
""""""""""""""""""

Size: Ensure that PRs don't exceed a certain size in terms of lines changed (excluding file patterns specified with ``ignore``).

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: size
            ignore: ['ignore_me.js', 'ignore_this_directory/*', '**/ignore_this_prefix*.js']
            lines:
              max:
                count: 500
                message: Change is very large. Should be under 500 lines of addtions and deletions.


Comment If Guidelines not met
"""""""""""""""""""""""""""""""""""""""""""""""

Automatically create a comment when a new issue is openened to remind the author when the title does not follow conventions or is missing a label.

::

    version: 2
    mergeable:
      - when: issues.opened
        validate:
          - do: title
            begins_with:
              match: ['AUTH', 'SOCIAL', 'CORE']
          - do: label
            must_include:
              regex: bug|enhancement
        fail:
          - do: comment
            payload:
              body: >
                The following problems were found with this issue:
                  - Title must begin with `AUTH`, `SOCIAL` or `CORE`
                  - The issue should either be labeled `bug` or `enhancement`

Check Stale PR and Issues
"""""""""""""""""""""""""""
Detect issues and pull requests that are n days old (stale) and notify authors and collaborators by creating a comment.

::

    version: 2
    mergeable:
      - when: schedule.repository
        validate:
          - do: stale
            days: 20
            type: pull_request, issues
        pass:
          - do: comment
            payload:
              body: This is old. Is it still relevant?

