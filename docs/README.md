<h1 align="center">
  <br>
  <img src="mergeable-flex.png" alt="Mergeable" width="197">
  <br>
  <p>Mergeable</p>
</h1>

<p align="center">
  <a href="https://github.com/apps/mergeable">
    <img src="https://img.shields.io/badge/FREE-INSTALL-orange.svg" alt="Free Install">
  </a>
  <a href="https://gitter.im/mergeable-bot/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/mergeable-bot/Lobby.svg">
  </a>
  <a href="https://circleci.com/gh/mergeability/mergeable">
    <img src="https://circleci.com/gh/mergeability/mergeable.svg?style=shield">
  </a>
  <a href="https://codecov.io/gh/jusx/mergeable">
    <img src="https://codecov.io/gh/jusx/mergeable/branch/master/graph/badge.svg">
  </a>
</p>

> 🤖 **Mergeable** helps automate your team's GitHub workflow without a single line of code.

Some examples of what you can do:

- Ensure pull requests follow conventions and [prevent merging](#pull-requests) when it is not followed.
- [Notify author of failed guidelines](#issues) when opening an issue.
- Schedule [detection for obsolete (stale) issues and pull requests](#staleness) and notify author and collaborators.
- And [more](#configuration)

---

**📖 Contents:** [Usage](#usage) ◦ [Configuration](#configuration) ◦ [Roadmap](#roadmap) ◦ [Support](#support) ◦ [Contributions](#contributions) ◦ [Authors](#authors)

---


# Usage

1. [Install](https://github.com/apps/mergeable) the Mergeable GitHub App.
2. [Create](#configuration) your recipe(s). Here are some [examples](#examples).
3. Commit and push the recipes to your repository at `.github/mergeable.yml`

> ☝ **NOTE:** You can also [deploy to your own server](deploy.md).

# Configuration

**Mergeable** is **highly** configurable.
Define your recipes by creating a `.github/mergeable.yml` file in your repository.

## Basics
The configuration consists of any number of recipes. Recipes are created by tying [events](#events) with a set of [validators](#validators) and [actions](#actions) together:

```yml
version: 2
mergeable:
  - when: {{event}}, {{event}} # can be one or more
    validate:
      # list of validators. Specify one or more.
      - do: {{validator}}
        {{option}}: # name of an option supported by the validator.
          {{sub-option}}: {{value}} # an option will have one or more sub-options.
    pass: # list of actions to be executed if all validation passes. Specify one or more. Omit this tag if no actions are needed.
      - do: {{action}}
    fail: # list of actions to be executed when at least one validation fails. Specify one or more. Omit this tag if no actions are needed.
      - do: {{action}}
    error: # list of actions to be executed when at least one validator throws an error. Specify one or more. Omit this tag if no actions are needed.
      - do: {{action}}
```

Take a look at some [example recipes](#examples).

> ☝ **NOTE:** Earlier versions used a [different set of convention](version1.md#configuration). It will be supported in the foreseeable future but will eventually be phased out.

## Events
Events are specified in the `when` tag like this:

```yml
- when: pull_request.opened
```

Multiple events for a recipe are declared comma delimited like this:

```yml
- when: pull_request.opened, issues.opened
```

Events supported for pull requests are as follows:
`pull_request.opened`, `pull_request.edited`, `pull_request_review.submitted`, `pull_request_review.edited`, `pull_request_review.dismissed`, `pull_request.labeled`, `pull_request.unlabeled`, `pull_request.milestoned`, `pull_request.demilestoned`, `pull_request.assigned`, `pull_request.unassigned`, `pull_request.synchronize`,

And for issues:
`issues.opened`, `issues.edited`, `issues.labeled`, `issues.unlabeled`, `issues.milestoned`, `issues.demilestoned`, `issues.assigned`, `issues.unassigned`, `issues.synchronize`

>  ☝ **NOTE:** More details about events can be found on the [GitHub events page](https://developer.github.com/v3/activity/events).

For convenience, wildcards can be used: `pull_request.*`, `issues.*`, `pull_request_review.*`


> ☝ **NOTE:**  Each `validator` and `action` declares it's own supported events. Read the [validator](#validators) and [action](#actions) sections to find out which events are supported respectively.

## Validators

### approvals

```yml
- do: approvals
  min:
    count: 2 # Number of minimum reviewers. In this case 2.
    message: 'Custom message...'
  required:
    reviewers: [ user1, user2 ]   # list of github usernames required to review
    owners: true # accepts boolean. When true,  the file .github/CODEOWNER is read and owners made required reviewers
    message: 'Custom message...'
```

Supported events:

```js
'pull_request.*', 'pull_request_review.*'
```

### assignee

```yml
- do: assignee
  max:
    count: 2 # There should not be more than 2 assignees
    message: 'test string' # this is optional
  min:
    count: 2 # min number of assignees
    message: 'test string' # this is optional
```

Supported events:

```js
'pull_request.*', 'pull_request_review.*', 'issues.*'
```

### dependent
`dependent` validates that the files specified are all part of a pull request (added or modified).

```yml
  - do: dependent
    files: ['package.json', 'yarn.lock'] # list of files that are dependent on one another and must all be part of the changes in a PR.
    message: 'Custom message...' # this is optional, a default message is used when not specified.
```

Alternatively, to validate dependent files only when a specific file is part of the pull request, use the `changed` option:

```yml
  - do: dependent
    changed:
      file: package.json
      files: ['package-lock.json', 'yarn.lock']
    message: 'Custom message...' # this is optional, a default message is used when not specified.
```

The above will validate that both the files `package-lock.json` and `yarn.lock` is part of the modified or added files if and only if `package.json` is part of the PR.

### Size

`size` validates that the size of changes in the pull request conform to a
specified limit. Currently this only lets you validate that the total number of
changed lines is below a certain amount using the `max` option:

```yml
  - do: size
    lines:
      max:
        count: 500
        message: Change is very large. Should be under 500 lines of addtions and deletions.
```

It also supports an `ignore` setting to allow excluding certain files from the
total size (e.g. for ignoring automatically generated files that increase the
size a lot):

```yml
  - do: size
    ignore: ['package-lock.json']
    lines:
      max:
        count: 500
        message: Change is very large. Should be under 500 lines of addtions and deletions.
```

The `size` validator currently excludes from the size count any files that were
completely deleted in the PR.

#### Supported events
```js
'pull_request.*', 'pull_request_review.*'
```

### description
```yml

  - do: description
    no_empty:
       enabled: false # Cannot be empty when true.
       message: 'Custom message...' # this is optional, a default message is used when not specified.
    must_include:
       regex: '### Goals|### Changes'
       message: >
        Please describe the goals (why) and changes (what) of the PR.
      # message is is optional, a default message is used when not specified.
    must_exclude:
       regex: 'DO NOT MERGE'
       message: 'Custom message...' # optional
    begins_with:
       match: '### Goals' # or array of strings
       message: 'Some message...' #optional
    ends_with:
       match: 'Any last sentence' # array of strings
       message: 'Come message...' # optional
```
Supported events:

```js
'pull_request.*', 'pull_request_review.*', 'issues.*'
```

### label
```yml

  - do: label
    no_empty:
       enabled: false # Cannot be empty when true.
       message: 'Custom message...'
    must_include:
       regex: 'type|chore|wont'
       message: 'Custom message...'
    must_exclude:
       regex: 'DO NOT MERGE'
       message: 'Custom message...'
    begins_with:
       match: 'A String' # or array of strings
       message: 'Some message...'
    ends_with:
       match: 'A String' # or array of strings
       message: 'Come message...'
    # all of the message sub-option is optional
```
Supported events:

```js
'pull_request.*', 'pull_request_review.*', 'issues.*'
```

### milestone
```yml

- do: milestone
  no_empty:
     enabled: true # Cannot be empty when true.
     message: 'Custom message...'
  must_include:
     regex: 'type|chore|wont'
     message: 'Custom message...'
  must_exclude:
     regex: 'DO NOT MERGE'
     message: 'Custom message...'
  begins_with:
     match: 'A String' # array of strings
     message: 'Some message...'
  ends_with:
     match: 'A String' # array list of strings
     message: 'Come message...'
  # all of the message sub-option is optional
```
> ☝ **NOTE:** When a [closing keyword](https://help.github.com/articles/closing-issues-using-keywords/) is used in the description of a pull request. The annotated issue will be validated against the conditions as well.

Supported events:

```js
'pull_request.*', 'pull_request_review.*', 'issues.*'
```

### project
```yml

- do: project
  no_empty:
     enabled: true # Cannot be empty when true.
     message: 'Custom message...'
  must_include:
     regex: 'type|chore|wont'
     message: 'Custom message...'
  must_exclude:
     regex: 'DO NOT MERGE'
     message: 'Custom message...'
  begins_with:
     match: 'A String' # array of strings
     message: 'Some message...'
  ends_with:
     match: 'A String' # array of strings
     message: 'Come message...'
     # all of the message sub-option is optional
```
> ☝ **NOTE:** When a [closing keyword](https://help.github.com/articles/closing-issues-using-keywords/) is used in the description of a pull request. The annotated issue will be validated against the conditions as well.

Supported events:

```js
'pull_request.*', 'pull_request_review.*', 'issues.*'
```

### stale

```yml
  - do: stale
    days: 20 # number of days ago.
    type: pull_request, issues # what items to search for.
```

Supported events:
```js
'schedule.repository'

```
 > ☝ **NOTE:** This is a special use case. The schedule event runs on an interval. When used with `stale`, it will search for issues and/or pull request that are n days old. [See a full example &raquo;](#stale)

### title
```yml

- do: title
  no_empty:
     enabled: true # Cannot be empty when true. A bit redundant in this case since GitHub don't really allow it. :-)
     message: 'Custom message...'
  must_include:
     regex: 'doc|feat|fix|chore'
     message: 'Custom message...'
  must_exclude:
     regex: 'DO NOT MERGE|WIP'
     message: 'Custom message...'
  begins_with:
     match: ['doc','feat','fix','chore']
     message: 'Some message...'
  ends_with:
     match: 'A String' # or array of strings
     message: 'Come message...'
     # all of the message sub-option is optional
```

### Advanced Logic
Validators can be grouped together with `AND` and `OR` operators:

```yml
- do: description
  and:
    - must_include:
        regex: 'Test Plan'
        message: 'Test plan must be included'
    - must_include:
        regex: 'Goal'
        message: 'Please include the goal of the PR'
```

`AND` and `OR` operators can also be nested

```yml
- do: label
  or:
    - and:
      - must_include:
          regex: 'release notes: yes'
          message: 'Please include release note: yes'
      - must_include:
          regex: '^lang\/'
           message: 'Please include a language label'
    - must_include:
        regex: 'release notes: no'
        message: 'Please include release note: no'
```

*Note* : `AND` and `OR` are not validators

## Actions

Actions are listed for execution at the `pass`, `fail` and `error` tags for a recipe based on the results of the [validation](#validators).

### comment
Creates comments in issues and/or pull requests depending on the event specified in the `when` tag.

```yml
- do: comment
  payload:
    body: >
      Your very long comment can go here.
```

Supported events:
```js
'schedule.repository', 'pull_request.*', 'issues.*'

```
### checks

```yml
- do: checks,
  status: 'success' # Can be: success, failure, neutral, cancelled, timed_out, or action_required
  payload:
    title: 'Mergeable Run have been Completed!'
    summary: `All the validators have returned 'pass'! \n Here are some stats of the run: \n {{validationCount}} validations were ran`
```

Supported events:
```js
'pull_request.*', 'pull_request_review.*'

```
## Examples

### Pull Requests

Validate pull requests for mergeability based on content and structure of your PR (title, labels, milestone, project, description, approvals, etc). Here are a few examples:

**Work In Progress**: Prevent accidental merging of Pull Requests that are work in progress by labeling it `WIP` or prefixing the title with the abbreviation.

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
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
  ```
  </p>
</details>
<br>

**Description**: Ensure all Pull Requests have a description so that reviewers have context.

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: description
          no_empty:
            enabled: true
            message: Description matter and should not be empty. Provide detail with **what** was changed, **why** it was changed, and **how** it was changed.
  ```
  </p>
</details>
<br>

**Dependent Files**: Certain files are related and you want to ensure that they are updated as part of the PR (i.e. if `package.json` is updated, so should `yarn.lock` and `package-lock.json`)

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: dependent
          changed:
            file: 'package.json'
            files: ['package-lock.json', 'yarn.lock']
  ```
  </p>
</details>
<br>

**Milestone**: Ensure that all Pull Requests have a milestone associated. Mergeable will also detect when you are [closing an issue](https://help.github.com/articles/closing-issues-using-keywords/) that is associated with the specified milestone.

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: milestone
          must_include:
            regex: Release 1
  ```
  </p>
</details>
<br>

**Size**: Ensure that PRs don't exceed a certain size in terms of lines changed
(excluding files specified with `ignore`).

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: size
          ignore: ['ignore_me.js']
          lines:
            max:
              count: 500
              message: Change is very large. Should be under 500 lines of addtions and deletions.
  ```
  </p>
</details>
<br>
<!-- **Projects**: Ensure that all Pull Requests have a Project associated. Mergeable will also detect when you are [closing an issue](https://help.github.com/articles/closing-issues-using-keywords/) that is associated with the specified project. Useful when you want to make sure all issues and pull requests merged are visible on a [project board](https://help.github.com/articles/about-project-boards/).
<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: project
          must_include: MVP
  ```
  </p>
</details> -->
<br>

Read the [configuration options](#configuration) for more options.

### Issues
Automatically create a comment when a new issue is `openened` to remind the author when the title does not follow conventions or is missing a label.

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
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
  ```
  </p>
</details>
<br>

Read the [configuration options](#configuration) for more options.

### Staleness

Detect issues and pull requests that are `n` days old (stale) and notify authors and collaborators by creating a comment.

<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
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
  ```
  </p>
</details>

# Roadmap

- Additional actions like `label` and `assign`
- Potentially, integration with external tools like pivotal tracker, slack and trello.
-  More likely [coveralls](https://coveralls.io/) or [sonarqube](https://www.sonarqube.org/).
- Able to prevent merging based on the size of pull request.

# Support
Found a bug? Have a question? Or just want to chat?

- Find us on [Gitter](https://gitter.im/mergeable-bot/Lobby).
- Create an [Issue](https://github.com/jusx/mergeable/issues/new).

# Contributions
We need your help:

- Have an **💡idea** for a **new feature**? Please [create a new issue](https://github.com/jusx/mergeable/issues) and tell us!
- **Fix a bug**, implement a new **validator** or **action** and [open a pull request](docs/CONTRIBUTING.md)!

> ☝️ **NOTE:** For development and testing. You'll want to [read about how to run it locally](deploy.md#running-locally).


# Authors
  - Originally created by [@jusx](https://twitter.com/jusx) 👉 follow him on [Twitter](https://twitter.com/jusx).
  - Co-authored by [@shine2lay](https://github.com/shine2lay)
  - Logo by [@minap0lis](https://www.instagram.com/minap0lis/)  👉  follow her on [Instagram](https://www.instagram.com/minap0lis/).
---
AGPL, Copyright (c) 2019 [Justin Law](https://github.com/jusx) & [Shine Lee](https://github.com/shine2lay)
