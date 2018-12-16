<h1 align="center">
  <br>
  <img src="m.png" alt="Mergeable" width="197">
  <br>
  <p>Mergeable</p>
</h1>

<h1 align="center">🤖 Easily automate your GitHub workflow.</h1>
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

> **Mergeable** automates your development process and increase efficiencies so that you can focus on shipping quality code faster.

Stop doing repetitive tasks manually and start automating them. Mergeable lets you create rules to validate and execute actions based on the results. All with no programming required.

## Key Features

- [Prevent pull requests to be merged](#pull-requests)  based on configured rulesets
- [Notify author of failed guidelines when openning an issue](#issues) based on configured rulesets
- [Detect stale issues and pull requests](#staleness) and notify author and collaborators.

### Pull Requests

Validate pull requests for mergeability based on content and structure of your PR (title, labels, milestone, project, description, approvals, etc). The rule-sets are fully configurable. Here are a few examples of what you can do:

- Prevent accidental merging of Pull Requests that are work in progress by labeling it `wip` or prefixing the title with the abbreviation.

- Ensure all Pull Requests have a description so that when you view through history you still have context.

- Ensure that all Pull Requests are approved by a specific list of users. It is especially useful if one of the users is not a collaborator of your repository -- something GitHub does not already support.

- Ensure that all Pull Requests merged are in a specific GitHub Project. Mergeable even detects when you are closing an issue that is associated with the right project. This is very useful when your process includes QA validation of stories.

- [And more](#configuration).

### Issues

There may be certain formats and structure you want your Github issues to adhere to. Mergeable allows you to configure this and will create a comment with a list of suggested improvements to your Issue.

- Notify the author and collaborators when an issues does not adhere to certain formats in the title.

- Notify when projects and milestones are not associated.

Check the example configuration for [all the available features](#configuration). The Mergeable project is ongoing and there are a lot more that we are working on.

### Staleness

Detect stale issues and pull requests. Notify authors and collaborators by leaving a comment. Staleness is defined through [configuration](#configuration).

## Usage

1. [Install](https://github.com/apps/mergeable) the Mergeable GitHub App.
2. [Configure](#configuration) your rules. Here are some [examples](#examples).
3. Commit and push the configuration to your repository at `.github/mergeable.yml`

![screenshot](screenshot.gif)

## Vision

The Mergeable vision is to make the software development effort efficient so that everyone can focus on building software.  

There are several areas in which we wish to automate for efficiency: consistency, workflow,  quality and statistics. The basic features for these areas are as follows:

### Consistency

- *Pull Request* validation for standards based on configured rulesets. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Notify by creating a comment in *Issues* that do not adhere to configured ruleset. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Ruleset across Repos. As a way to enforce and encourage standards in an organization or guide team members on the organizations' engineering best practises.

- Repo(s) audit. Scan repo(s) for standards configured in rulesets including existance OWNERS file, or .github contains TEMPLATES. Notify through creation of an issue in the repo(s).

### Workflow

- Kanban WIP limits. Limit the number of open Pull Requests by author.

- Staleness and Reminders: create a comment on any *Issue* or *Pull Request* found to be stale such that the author and collaborators are notified. ![completed](https://img.shields.io/badge/Status-completed-green.svg)

- Projects WIP Limits by column in GitHub Projects.

- Better GitHub Projects automation. i.e. When an issue is assigned, the card automatically moves from column 1 (i.e. `Backlog` if configured as such) to column 2 (i.e. `In Progress` if configured as such) in the kanban board.

- Improved Project Management Integrations (two way): Clubhouse, Pivotal Tracker, Jira, Trello

- Slack Integration.

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

Our longer term vision is to bring this automation to GitLab and BitBucket as well.

## Configuration

Mergeable is highly configurable. You can configure mergeable by creating a `.github/mergeable.yml` file in your repository.

WIP:
<!-- - Validators
- Actions -->

 The old [version 1 format](version1.md) of configuration will continue to work.

## Contributions
 [Contribute](CONTRIBUTING.md) by creating a pull request or create a [new issue](https://github.com/jusx/mergeable/issues) to request for features.

## Resources
- [Deploy](deploy.md) your own
- [Running it locally](deploy.md#running-locally) for development and testing.
