const Handler = require('./lib/handler')

module.exports = (robot) => {
  robot.on(
    [ 'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.unlabeled',
      'pull_request.synchronize'
    ],
    (context) => { Handler.handlePullRequest(context) }
  )

  robot.on(['issues.milestoned', 'issues.demilestoned'],
    (context) => { Handler.handleIssues(context) }
  )
  robot.on(['issues.opened'],
    (context) => { Handler.handleIssueOpened(context) }
  )
}
