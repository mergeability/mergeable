Size
^^^^^^^^^^
``size`` validates that the size of changes in the pull request conform to a specified limit. We can pass in three options: ``total``, ``additions`` or ``deletions``. Each of this take in a count and message.
Validates that the files specified are all part of a pull request (added or modified).

::

  - do: size
    lines:
      total:
        count: 500
        message: Change is very large. Should be under 500 lines of additions and deletions.
      additions:
        count: 250
        message: Change is very large. Should be under 250 lines of additions
      deletions:
        count: 250
        message: Change is very large. Should be under 250 lines of deletions.
      ignore_comments: false #if true, comments will not be counted toward the lines count

``max`` is an alias for total, so the below configuration is still valid.


.. warning::
    currently ``ignore_comments`` feat only works with '.js' and '.py' extensions, if you have request for more file extensions please create a ticket `here <https://github.com/mergeability/mergeable/issues/new>`_

::

     - do: size
       lines:
         max:
           count: 500
           message: Change is very large. Should be under 500 lines of additions and deletions.

It also supports an ``ignore`` or ``match`` setting to allow excluding or including certain files from the total size (e.g. for ignoring automatically generated files that increase the size a lot).

This option supports glob patterns, so you can provide either the path to a specific file or ignore whole patterns:

::

     - do: size
       match: ['src']
       ignore: ['package-lock.json', 'src/tests/__snapshots__/**', 'docs/*.md']
       lines:
         total:
           count: 500
           message: Change is very large. Should be under 500 lines of additions and deletions

In case both ``match`` and ``ignore`` are specified, the ``match`` filters are applied first.

Note that the glob functionality is powered by the minimatch library. Please see their documentation for details on how glob patterns are handled and possible discrepancies with glob handling in other tools.

The size validator currently excludes from the size count any files that were completely deleted in the PR.

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'
