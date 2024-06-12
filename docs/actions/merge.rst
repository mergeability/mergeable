Merge
^^^^^^^^

You can merge a pull request and specify the merge method used.

::

    - do: merge
      merge_method: 'merge' # Optional, default is 'merge'. Other options : 'rebase', 'squash'
      # template variables for next two items come from result of https://docs.github.com/en/rest/reference/pulls#get-a-pull-request
      # use triple curly braces to avoid html escaping
      commit_title: '{{{ title }}} (#{{{ number }}})' # Optional, override commit title
      commit_message: '{{{ body }}}' # Optional, override commit message


Supported Events:
::

    'pull_request.*', 'pull_request_review.*', 'status.*', 'check_suite.*', 'issue_comment.*'
