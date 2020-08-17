Contents
^^^^^^^^^^^^^^

::

    - do: contents
      files: # determine which files contents to validate
        pr_diff: true # If true, validator will grab all the added and modified files in the head of the PR
        ignore: ['.github/mergeable.yml'] # Optional, default ['.github/mergeable.yml'], pattern of files to ignore
      must_include:
         regex: 'yarn.lock'
         message: 'Custom message...'
      must_exclude:
         regex: 'package.json'
         message: 'Custom message...'
      begins_with:
         match: 'A String' # or array of strings
         message: 'Some message...'
      ends_with:
         match: 'A String' # or array of strings
         message: 'Come message...'

.. warning::
    ``merge`` action will not work currently as it require ``contents`` ``read:write`` permission which the mergeable doesn't have. We have plans to enable it in the near future

Supported Events:
::

    'pull_request.*', 'pull_request_review.*'