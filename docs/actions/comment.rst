Comment
^^^^^^^^

You can add a comment to a pull request or issue.

::

    - do: comment
      payload:
        body: >
          Your very long comment can go here.
          Annotations are replaced:
          - @author
          - @sender
          - @bot
          - @repository
          - @action
          - {{formatDate}} # today's date and time
          - {{formatDate created_at}} # PR/issue creation date and time
          - {{title}} # PR/issue title
          - {{body}} # PR/issue description
      leave_old_comment: true # Optional, by default old comments are deleted, if true, old comments will be left alone

Supported Events:
::

    'schedule.repository', 'pull_request.*', 'issues.*', 'issue_comment.*'
