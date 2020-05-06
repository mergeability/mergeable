Stale
^^^^^^^^^^^^^^

::

    - do: stale
    days: 20 # number of days ago.
    type: pull_request, issues # what items to search for.

.. note::
    This is a special use case. The schedule event runs on an interval. When used with stale, it will search for issues and/or pull request that are n days old. See a full example »

Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'issues.*'