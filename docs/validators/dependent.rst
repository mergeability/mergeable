Dependent
^^^^^^^^^^
Validates that the files specified are all part of a pull request (added or modified).
::

  - do: dependent
    files: ['package.json', 'yarn.lock'] # list of files that are dependent on one another and must all be part of the changes in a PR.
    message: 'Custom message...' # this is optional, a default message is used when not specified.

Alternatively, to validate dependent files only when a specific file is part of the pull request, use the changed option:

::

    - do: dependent
        changed:
          file: package.json
          files: ['package-lock.json', 'yarn.lock']
        message: 'Custom message...' # this is optional, a default message is used when not specified.

The above will validate that both the files package-lock.json and yarn.lock is part of the modified or added files if and only if package.json is part of the PR.

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'