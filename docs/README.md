<h1 align="center">
  <br>
  <img src="m.png" alt="Mergeable" width="197">
  <br>
  <p>Mergeable</p>
</h1>

<h2 align="center">🤖 Easily automate your GitHub workflow.</h2>
<p align="center">
  <a href="https://github.com/apps/mergeable">
    <img src="https://img.shields.io/badge/FREE-INSTALL-orange.svg" alt="Free Install">
  </a>
  <a href="https://gitter.im/mergeable-bot/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/mergeable-bot/Lobby.svg">
  </a>
  <a href="https://circleci.com/gh/jusx/mergeable">
    <img src="https://circleci.com/gh/jusx/mergeable.svg?style=shield">
  </a>  
</p>

> **Mergeable** automates your GitHub workflow to increase engineering efficiencies so that you can focus on shipping quality code faster.

Automate without coding by creating recipes to:

- Ensure Pull Requests follow conventions and [prevent accidental merging of Pull Requests](#pull-requests)
- [Notify author of failed guidelines](#issues) when opening an issue.
- [Detect stale issues and pull requests](#staleness) and notify author and collaborators.
- And [more](#configuration)

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
**Descriptions**: Ensure all Pull Requests have a description so that reviewers have context.
<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: description
          no_empty: true
  ```
  </p>
</details>
<br>
**Dependent Files**: Certain files are related and you want to ensure that they are updated and part of the PR (i.e. if `package.json` is updated, so should `yarn.lock`)
<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: description
          no_empty: true
  ```
  </p>
</details>
<br>
**Projects**: Ensure that all Pull Requests have a Project associated. Mergeable will also detect when you are [closing an issue](https://help.github.com/articles/closing-issues-using-keywords/) that is associated with the specified project. Useful when you want to make sure all issues and pull requests merged are visible on a [project board](https://help.github.com/articles/about-project-boards/).
<details><summary>🔖 See Recipe</summary>
  <p>

  ```yml
  version: 2
  mergeable:
    - when: pull_request.*
      validate:
        - do: description
          no_empty: true
  ```
  </p>
</details>
<br>
Read the [configuration options](#configuration) for other possibilities.

### Issues

There may be certain formats and structure you want your Github issues to adhere to. Mergeable allows you to configure this and will create a comment with a list of suggested improvements to your Issue.

- Notify the author and collaborators when an issues does not adhere to certain formats in the title.

- Notify when projects and milestones are not associated.

Check the example configuration for [all the available features](#configuration). The Mergeable project is ongoing and there are a lot more that we are working on.

### Staleness

Detect stale issues and pull requests. Notify authors and collaborators by leaving a comment. Staleness is defined through [configuration](#configuration).

# Usage

1. [Install](https://github.com/apps/mergeable) the Mergeable GitHub App.
2. [Configure](#configuration) your rules. Here are some [examples](#examples).
3. Commit and push the configuration to your repository at `.github/mergeable.yml`


# Vision

The Mergeable vision is to increase the efficiency of teams and their software development process by automating as much of the workflow as possible.

We want to make it really simple to create recipes for any automation without writing a single line of code.

There are several areas that we wish to automate for efficiency:
consistency, workflow, quality and statistics. The basic features for these areas are as follows:

### Consistency

- *Pull Request* validation for standards based on configured rulesets. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Notify by creating a comment in *Issues* that do not adhere to configured ruleset. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Ruleset across Repos. As a way to enforce and encourage standards in an organization or guide team members on the organizations' engineering best practices.

- Repo(s) audit. Scan repo(s) for standards configured in rulesets including existence OWNERS file, or that `.github` contains TEMPLATES. Notify through creation of an issue in the repo(s).

### Workflow

- Kanban WIP limits. Limit the number of open Pull Requests by author.

- Staleness and Reminders: create a comment on any *Issue* or *Pull Request* found to be stale such that the author and collaborators are notified. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Projects WIP Limits by column in GitHub Projects.

- Better GitHub Projects automation. i.e. When an issue is assigned, the card automatically moves from column 1 (i.e. `Backlog` if configured as such) to column 2 (i.e. `In Progress` if configured as such) in the Kanban board.

- Improved Project Management Integrations (two way): Clubhouse, Pivotal Tracker, Jira, Trello

- Notification integration with collaborative tools like Slack, email, and others.

### Quality

- Detect language and/or testing framework in a repos -- For example: ensure coverage must be greater than 80% or based on config. Suggest testing frameworks if none exists (display configured guideline by creating an issue etc.).
- Suggest (by creating an issue in the repo) testing frameworks if none exists.
- Linting standard. Automatically run linter based on tech stack.
- Security analysis.

### Statistics

- Top contributor across repos.
- Pull Request Merged.
- Number of commits, comments, reviews.
- Leaderboard.

We are starting with GitHub but eventually hope to bring this to GitLab and BitBucket as well.

# Configuration

Mergeable is highly configurable. You can configure mergeable by creating a `.github/mergeable.yml` file in your repository.

WIP:
<!-- - Validators
- Actions -->

 The old [version 1 format](version1.md) of configuration will continue to work.

# Contributions
 [Contribute](CONTRIBUTING.md) by creating a pull request or create a [new issue](https://github.com/jusx/mergeable/issues) to request for features.

# Resources
- [Deploy](deploy.md) your own
- [Running it locally](deploy.md#running-locally) for development and testing.
