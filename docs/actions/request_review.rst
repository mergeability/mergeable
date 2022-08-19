Request Review
^^^^^^^^^^^^^^^

You can request specific reviews from specific reviewers, teams, or both

::

    - do: request_review
      reviewers: ['name1', 'name2']
      teams: ['developers'] # team names without organization

Supported Events:
::

    'pull_request.*'
