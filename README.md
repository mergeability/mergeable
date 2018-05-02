
![icon](mergeable.png)
# The Mergeable Bot
A GitHub App that prevents merging of pull requests based on [configurations](#configuration). Make your pull requests mergeable only when:

- Certain terms are not in the **title** and/or **label** (i.e. "work in progress").

- The **milestone** on the pull request matches with what is configured.

- There are at least `n` number of **approved reviews**, where `n` is configurable.


![Screenshot](https://raw.githubusercontent.com/jusx/mergeable/5d9c9cab357b12b84af62044ac46648d9fca84c4/screenshot.gif)
> [Install it](https://github.com/apps/mergeable) or [deploy your own](#deploy-your-own).

The Mergeable Bot is built with [probot](https://github.com/probot/probot).

## Configuration
By default the Mergeable configuration is as follows:

```yml
mergeable:
  # PR must not have any label that has the following terms to be mergeable
  label: 'work in progress|do not merge|experimental|proof of concept'

  # PR must not have any of the following terms in the title. i.e. (wip) My PR Title
  title: 'wip|dnm|exp|poc'

  # Minimum of 1 review approval is needed.
  approvals: 1
```

You can override the defaults by creating a `.github/mergeable.yml` file in your repository.

All configurations are optional. Here is an example:

```yml
mergeable:
  # Minimum of 5 approvals is needed.
  approvals: 5

  # Regular expression. In this example, whenever a PR has a label with the words wip, do not merge or experimental it will not be mergeable
  label: 'wip|do not merge|experimental'

  # Regular expression to be tested on the title. Not mergeable when true.  
  title: 'wip'

  # Only mergeable when milestone is as specified below.
  milestone: 'version 1'

  # exclude any of the checks above. Comma separated list. For example, the following will exclude checks for approvals and label.
  exclude: 'approvals, label'
```

## Usage

### Install the app
1. [Install](https://github.com/apps/mergeable) the Mergeable GitHub App.
2. [Configure](#configuration) Mergeable or do nothing else and just go with the default.
3. Ensure branch is protected and [Require status checks to pass before merging](https://help.github.com/articles/enabling-required-status-checks/) is checked.

### Deploy your own

If you would like to run your own instance of this plugin, see the [docs for deploying GitHub Apps](https://github.com/probot/probot/blob/master/docs/deployment.md).

This GitHub App requires these permissions & events:

- Repository metadata - **Read & Write**
- Pull requests - **Read Only**
- Issues - **Read Only**
- Single File - **Read-only**
  - Path: `.github/mergeable.yml`

And subscription to the following events:
- [x] Pull request
- [x] Pull request review comment
- [x] Pull request review
- [x] Issues

---
[![CircleCI](https://circleci.com/gh/jusx/mergeable.svg?style=shield)](https://circleci.com/gh/jusx/mergeable)
