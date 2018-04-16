# The Mergeable Bot
A GitHub App that prevents merging of pull requests based on [configurations](#configuration).

This is a GitHub App built with [probot](https://github.com/probot/probot).

## Configuration
By default the Mergeable configuration is as follows:

```yml
mergeable:
  # PR must not have any label that is tested true with the following regex
  label: 'wip|do not merge|work in progress|experimental'

  # PR must not have a title that is tested true with the following regex
  title: 'wip|do not merge|poc'

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
  title: 'wip|poc' #  
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

Deploy to your server and configure it as a GitHub App.
