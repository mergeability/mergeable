const { Validator } = require('./validator')
const _ = require('lodash')
const mustInclude = require('./options_processor/options/must_include')
const constructOutput = require('./options_processor/options/lib/constructOutput')
const consolidateResult = require('./options_processor/options/lib/consolidateResults')

const MESSAGE_NOT_FOUND_ERROR = 'Failed to run the \'commit\' validator because \'message\' option is not found. Please check README for more information about configuration'
const REGEX_NOT_FOUND_ERROR = 'Failed to run the test because \'regex\' is not provided for \'message\' option. Please check README for more information about configuration'
const DEFAULT_FAIL_MESSAGE = 'Some or all of your commit messages doesn\'t meet the criteria'
const DEFAULT_SUCCESS_MESSAGE = 'Your commit messages met the specified criteria'

class Commit extends Validator {
  constructor () {
    super('commit')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      jira: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string'
      },
      message: {
        regex: 'string',
        regex_flag: 'string',
        message: 'string',
        skip_merge: 'boolean',
        oldest_only: 'boolean',
        newest_only: 'boolean',
        single_commit_only: 'boolean'
      }
    }
  }

  async validate (context, validationSettings) {
    if (_.isUndefined(validationSettings.message)) throw Error(MESSAGE_NOT_FOUND_ERROR)
    if (_.isUndefined(validationSettings.message.regex)) throw Error(REGEX_NOT_FOUND_ERROR)

    const messageSettings = validationSettings.message
    const oldestCommitOnly = _.isUndefined(messageSettings.oldest_only) ? false : messageSettings.oldest_only
    const newestCommitOnly = _.isUndefined(messageSettings.newest_only) ? false : messageSettings.newest_only
    const skipMerge = _.isUndefined(messageSettings.skip_merge) ? true : messageSettings.skip_merge
    const singleCommitOnly = _.isUndefined(messageSettings.single_commit_only) ? false : messageSettings.single_commit_only

    const validatorContext = { name: 'commit' }

    const commits = await this.githubAPI.listCommits(context, this.getPayload(context).number)
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

    if (newestCommitOnly) {
      orderedCommits = [orderedCommits[orderedCommits.length - 1]]
    }

    const commitMessages = orderedCommits.map(commit => commit.message)

    const result = await mustInclude.process(validatorContext, commitMessages, {
      must_include: {
        all: true,
        regex: messageSettings.regex,
        regex_flag: messageSettings.regex_flag,
        message: messageSettings.message ? messageSettings.message : DEFAULT_FAIL_MESSAGE
      }
    })

    if (result.status === 'pass') {
      result.description = DEFAULT_SUCCESS_MESSAGE
    }
    const output = [constructOutput(validatorContext, commitMessages, validationSettings, result)]

    return consolidateResult(output, validatorContext)
  }
}

module.exports = Commit
