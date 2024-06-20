.. _recipes-page:

Recipes
--------------------------

.. note::
  Check out our :ref:`annotations-page` page for possible placeholders in values.

Work In Progress
"""""""""""""""""
Prevent accidental merging of Pull Requests that are work in progress by labeling it `WIP` or prefixing the title with the abbreviation.

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
              regex: 'wip|work in progress'

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


Greet a new contributor
"""""""""""""""""""""""
Add a comment on a pull request when it is created

::

    version: 2
    mergeable:
      - when: pull_request.opened
        name: "Greet a contributor"
        validate: []
        pass:
          - do: comment
            payload:
              body: >
                Thanks for creating a pull request! A maintainer will review your changes shortly. Please don't be discouraged if it takes a while.


React on a comment to merge pull requests
"""""""""""""""""""""""""""""""""""""""""
When a human creates a new comment or edits existing comment, ``mergeable`` finds a special command in it, to then execute a merge.
The comment writer must be different from the PR author and be member of a specified team.

::

    version: 2
    mergeable:
      - when: issue_comment.*
        name: "Merge pull requests when requested via comment"
        filter:
          - do: payload
            sender:
              login:
                must_exclude:
                  regex: '\[bot\]$'
        validate:
          - do: lastComment
            must_include:
              regex: 'merge$'
              message: 'Comment "merge" detected, checking eligibility to merge the PR.'
            must_exclude:
              regex: '^\[ \]'
              message: 'Comment contains unchecked items, can't merge yet.'
            comment_author:
              one_of: ['@org/product-owners-team']
              none_of: ['@author']
        pass:
          - do: merge
            merge_method: "squash"

Auto-merge pull requests once all checks pass
"""""""""""""""""""""""""""""""""""""""""""""
This recipe relies on the fact that the main branch has been protected and only allows merges
when the required checks have passed or the required number of reviews/other conditions are met.
This basically means that ``mergeable`` will merge the pull request as soon as it shows a green merged button
on Github.

Notice the blank validator which ensures that the merge event happens as soon as Github allows ``mergeable`` to merge the pull request.

::

    version: 2
    mergeable:
      - when: pull_request.*, pull_request_review.*, status.*, check_suite.*
        name: "Automatically merge pull requests once it passes all checks"
        validate: []
        pass:
          - do: merge
            merge_method: "squash"

Approval check + title check if certain files are changed
"""""""""""""""""""""""
Add 2 checks to the PR
1. Approval check - Checks whether the PR has been approved by certain people
2. Title should match a regex if certain files are changed. If no changes are made in those files, check should pass

::

    version: 2
    mergeable:
      - when: pull_request.*, pull_request_review.*
        name: 'Approval check'
        validate:
          - do: approvals
            min:
              count: 1
            limit:
              users: [ 'approverA', 'approverB' ]

      - when: pull_request.*, pull_request_review.*
        name: 'PR title check'
        validate:
          - do: or
            validate:
              - do: changeset
                must_exclude:
                  regex: 'some/regex/for/those/certain/files/*'
              - do: and
                validate:
                  - do: changeset
                    must_include:
                      regex: 'some/regex/for/those/certain/files/*'
                  - do: title
                    begins_with:
                      match: [ 'some prefix' ]


Only run rules if PR is not a draft
"""""""""""""""""""""""
Checks that the PR's draft state is false before running actions.

::

    version: 2
    mergeable:
      - when: pull_request.*, pull_request_review.*
        name: 'Draft check'
        filter:
          - do: payload
            pull_request:
              draft:
                boolean:
                  match: false
        validate:
          - do: description
            no_empty:
              enabled: true
              message: Description must be present when PR is not a draft


Allow commits only if they contain a Issue ID (like an Azure DevOps Work Item)
"""""""""""""""""""""""
Checks that the PR's draft state is false before running actions.

::

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: commit
            message:
                regex: '^(AB#[0-9]{1,})' #check if all commit messages begin with an AzDO Work Item
        pass: 
          - do: comment
            payload:
              body: >
               <h2>Successfully checked for Azure Work Item IDs in commits</h2>
               <h3>All commits in your PR have Azure Board Work Item IDs. Ready for Review!</h3>
               :+1:
          - do: labels
            add: 'Ready for Review'
        fail:
          - do: comment
            payload:
              body: >
                :warning: 
                <h2>Azure Boards Work Item IDs missing in commits</h2>
                <h3>Some commits messages were found not having the Azure Boards Work Item ID (AB#1234).</h3>
                <h3>We will close this PR for now.</h3>
                <h3>To resolve, please do one of the following</h3>
                <ul>
                  <li>Identify your Azure Boards Work Item ID and <a href="https://gist.github.com/nepsilon/156387acf9e1e72d48fa35c4fabef0b4">amend your commits</a>. Then re-open the PR</li>
                  <li>In case you do not have a Work Item ID to reference, please discuss with your reviewer(s) for alternate options</li>
                </ul>
          - do: labels
            add: 'Non-Compliant'
          - do: close
      
