Stale
^^^^^^^^^^^^^^

::

    - do: stale
      days: 20 # number of days ago.
      type: pull_request, issues # what items to search for.
      ignore_drafts: true # if set to true, the stale check will ignore draft items
      ignore_milestones: true # if set to true, the stale check will ignore items that have an associated milestone
      ignore_projects: true # if set to true, the stale check will ignore items that have an associated project
      label: # optional property to filter the items that are actioned upon
        match: ['label1_to_match', 'label2_to_match'] # only items with matching labels will be actioned upon and marked as stale
        ignore: ['label1_to_ignore', 'label2_to_ignore'] # items with these labels will be ignored and not marked as stale
      time_constraint: # Optional, run the validator only if it in within the time constraint
        time_zone: 'America/Los_Angeles' # Optional, UTC time by default, for valid timezones see `here <https://momentjs.com/timezone/>`_
        hours_between: ['9', '17'] # Optional, 24 hours by default, run only if [0] >= Hour Now <= [1]
        days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] # Optional, 7 days a week by default, specific the days of the week in which to run the validator

.. note::
    This is a special use case. The schedule event runs on an interval. When used with stale, it will search for issues and/or pull request that are n days old. See a full example »

Supported Events:
::

    'schedule.repository'
