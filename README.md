# The Mergeable Bot
A GitHub App that prevents merging of pull requests based on [configurations](#configuration):

- Prevent your pull requests from being mergeable when certain terms are in the **title** or **label**.

- Prevent your pull requests from being mergeable when the **milestone** on the pull request does not match with what is configured.

- Make your pull requests mergeable only when there are `n` number of **approved reviews** where `n` is configurable.

<blockquote>
[Install it](https://github.com/apps/mergeable) or [deploy your own](#deploy-your-own)
</blockquote>

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
```

## Usage

### Install the app
1. [Install and Configure](https://github.com/apps/mergeable) the Mergeable GitHub App.
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
