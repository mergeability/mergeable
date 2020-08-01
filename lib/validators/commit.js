const { Validator } = require('./validator')
const _ = require('lodash')
const mustInclude = require('./options_processor/options/must_include')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')

const MESSAGE_NOT_FOUND_ERROR = `Failed to run the 'commit' validator because 'message' option is not found. Please check README for more information about configuration`
const REGEX_NOT_FOUND_ERROR = `Failed to run the test because 'regex' is not provided for 'message' option. Please check README for more information about configuration`
const DEFAULT_FAIL_MESSAGE = `Some or all of your commit messages doesn't meet the criteria`
const DEFAULT_SUCCESS_MESSAGE = `Your commit messages met the specified criteria`

class Commit extends Validator {
  constructor () {
    super('commit')
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request_review.submitted',
      'pull_request_review.edited',
      'pull_request_review.dismissed',
      'pull_request.labeled',
      'pull_request.milestoned',
      'pull_request.demilestoned',
      'pull_request.assigned',
      'pull_request.unassigned',
      'pull_request.unlabeled',
      'pull_request.synchronize',
      'pull_request.push_synchronize'
    ]
    this.supportedSettings = {
      message: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string',
        skip_merge: 'boolean',
        oldest_only: 'boolean',
        single_commit_only: 'boolean'
      }
    }
  }

  async validate (context, validationSettings) {
    if (_.isUndefined(validationSettings.message)) throw Error(MESSAGE_NOT_FOUND_ERROR)
    if (_.isUndefined(validationSettings.message.regex)) throw Error(REGEX_NOT_FOUND_ERROR)

    let messageSettings = validationSettings.message
    let oldestCommitOnly = _.isUndefined(messageSettings.oldest_only) ? false : messageSettings.oldest_only
    let skipMerge = _.isUndefined(messageSettings.skip_merge) ? true : messageSettings.skip_merge
    let singleCommitOnly = _.isUndefined(messageSettings.single_commit_only) ? false : messageSettings.single_commit_only

    const validatorContext = { name: 'commit' }

    let commits = await context.github.paginate(
      context.github.pulls.listCommits.endpoint.merge(
        context.repo({ pull_number: this.getPayload(context).number })
      ),
      res => res.data.map(o => ({ message: o.commit.message, date: o.commit.author.date }))
    )
    let orderedCommits = _.orderBy(commits, ['date'], ['asc'])

    if (singleCommitOnly && orderedCommits.length !== 1) {
      return consolidateResult([constructOutput(
        validatorContext,
        orderedCommits.map(commit => commit.message),
        validationSettings,
        {
          status: 'pass',
          description: 'Since there are more than one commits, Skipping validation'
        }
      )], validatorContext)
    }

    if (skipMerge) {
      orderedCommits = orderedCommits.filter(commit => !commit.message.includes('Merge branch'))
    }

    if (oldestCommitOnly) {
      orderedCommits = [orderedCommits[0]]
    }

    const commitMessages = orderedCommits.map(commit => commit.message)

    const result = mustInclude.process(validatorContext, commitMessages, {
      must_include: {
        all: true,
        regex: messageSettings.regex,
        regex_flag: messageSettings.regex_flag,
        message: messageSettings.message ? messageSettings.message : DEFAULT_FAIL_MESSAGE
      }})

    if (result.status === 'pass') {
      result.description = DEFAULT_SUCCESS_MESSAGE
    }
    const output = [constructOutput(validatorContext, commitMessages, validationSettings, result)]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Commit
