Approvals
^^^^^^^^^^

::

    - do: approvals
      min:
        count: 2 # Number of minimum reviewers. In this case 2.
        message: 'Custom message...'
      required:
        reviewers: [ user1, user2 ] # list of github usernames required to review
        owners: true # Optional boolean. When true, the file .github/CODEOWNERS is read and owners made required reviewers
        assignees: true # Optional boolean. When true, PR assignees are made required reviewers.
        requested_reviewers: true # Optional boolean. When true, all the requested reviewer's approval is required
        message: 'Custom message...'
      block:
        changes_requested: true # If true, block all approvals when one of the reviewers gave 'changes_requested' review
        message: 'Custom message...'
      limit:
        teams: ['org/team_slug'] # when the option is present, only the approvals from the team members will count
        users: ['user1', 'user2'] # when the option is present, approvals from users in this list will count
        owners: true # Optional boolean. When true, the file .github/CODEOWNER is read and only owners approval will count


.. note::
    If you receive an error for `Resource not accessible by integration' for Owners file, it means you haven't given mergeable read file permission

.. note::
    ``owners`` file now support teams as well, make sure to use `@organization/team-slug` format.


Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
