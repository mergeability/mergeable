Stale
^^^^^^^^^^^^^^

::

    - do: stale
      days: 20 # number of days ago.
      type: pull_request, issues # what items to search for.
      time_constraint: # Optional, run the validator only if it in within the time constraint
        time_zone: 'America/Los_Angeles' # Optional, UTC time by default, for valid timezones see `here <https://momentjs.com/timezone/>`_
        hours_between: ['9', '17'] # Optional, 24 hours by default, run only if [0] >= Hour Now <= [1]
        days_of_Week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] # Optional, 7 days a week by default, specific the days of the week in which to run the validator

.. note::
    This is a special use case. The schedule event runs on an interval. When used with stale, it will search for issues and/or pull request that are n days old. See a full example »

Supported Events:
::

    'schedule.repository'