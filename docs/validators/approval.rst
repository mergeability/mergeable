Approvals
^^^^^^^^^^

::

    - do: approvals
      min:
        count: 2 # Number of minimum reviewers. In this case 2.
        message: 'Custom message...'
      required:
        reviewers: [ user1, user2 ] # list of github usernames required to review
        owners: true # Optional boolean. When true, the file .github/CODEOWNER is read and owners made required reviewers
        assignees: true # Optional boolean. When true, PR assignees are made required reviewers.
        pending_reviewer: true # Optional boolean. When true, all the requested reviewer's approval is required
        message: 'Custom message...'
      block:
        changes_requested: true # If true, block all approvals when one of the reviewers gave 'changes_requested' review
        message: 'Custom message...'
      limit:
        teams: ['org/team_slug'] # when the option is present, only the approvals from the team members will count

.. warning::
    ``owners`` sub-option only works in public repos right now, we have plans to enable it for private repos in the future.

.. warning::
    ``teams`` option will not work right now, it require `team:read` permission which mergeable doesn't have, we have plans to request it in the near future.

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'