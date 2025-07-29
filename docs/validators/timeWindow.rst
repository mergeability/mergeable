TimeWindow
^^^^^^^^^^^^^^

The timeWindow validator allows you to block actions (like merging pull requests) during specific time periods. This is useful for implementing deployment freezes, maintenance windows, or weekend restrictions.

::

    - do: timeWindow
      time_zone: "America/New_York" # Optional global timezone (applied to all freeze periods unless overridden explicitly), defaults to UTC
      freeze_periods:
        - start_day: "Fri"
          start_hour: 17                # 5pm (24-hour format)
          end_day: "Mon"
          end_hour: 9                   # 9am (24-hour format)
          time_zone: "America/New_York" # Optional per-period timezone (overrides global)
          message: "Pull requests cannot be merged during weekend freeze (Friday 5pm ET - Monday 9am ET)."

Multiple freeze periods example:

::

    - do: timeWindow
      freeze_periods:
        # Daily maintenance window
        - start_day: "Tue"
          start_hour: 2         # 2am UTC
          end_day: "Tue"
          end_hour: 4           # 4am UTC
          time_zone: "UTC"
          message: "Maintenance window active (2am-4am UTC Tuesday)"
        # Weekend freeze  
        - start_day: "Fri"
          start_hour: 17        # 5pm EST
          end_day: "Mon"
          end_hour: 9           # 9am EST  
          time_zone: "America/New_York"
          message: "Weekend deployment freeze active"

Single day freeze window:

::

    - do: timeWindow
      freeze_periods:
        - start_day: "Fri"
          start_hour: 14
          end_day: "Fri"        # Same day
          end_hour: 17
          time_zone: "America/New_York"
          message: "Friday afternoon freeze active"

.. note::
    - Hours are specified in 24-hour format (0-23)
    - Days are specified as 3-letter abbreviations: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    - Time zones use standard IANA timezone names (e.g., "America/New_York", "UTC", "Europe/London")
    - If no time_zone is specified in a freeze period, the global time_zone is used, or UTC by default
    - Multi-day periods (e.g., Friday to Monday) handle week boundaries correctly

Supported Events:
::

    'pull_request.*', 'pull_request_review.*' 