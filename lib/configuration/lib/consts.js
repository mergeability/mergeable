module.exports = {
  CHECKS_PASS_DEFAULT_TITLE: 'Success! You are ready to Merge',
  CHECKS_PASS_DEFAULT_SUMMARY: 'The following tests were run \n {{#validatorResult}}- {{status}} {{message}} {{/validatorResult}}',
  CHECKS_FAIL_DEFAULT_TITLE: 'Mergeable found some failed checks!',
  CHECKS_FAIL_DEFAULT_SUMMARY: 'The following tests were run \n {{#validatorResult}}- {{status}} {{message}} {{/validatorResult}}',
  CONFIGURATION_FILE_PATH: '.github/mergeable.yml',
  ERROR_INVALID_YML: 'Invalid mergeable YML file format. Root mergeable node is missing.',
  DEFAULT_PASS: [{
    checks: {
      state: 'completed',
      status: 'success',
      payload: {
        title: this.CHECKS_PASS_DEFAULT_TITLE,
        summay: this.CHECKS_PASS_DEFAULT_SUMMARY
      }
    }
  }],
  DEFAULT_FAIL: [{
    checks: {
      state: 'completed',
      status: 'fail',
      payload: {
        title: this.CHECKS_FAIL_DEFAULT_TITLE,
        summay: this.CHECKS_FAIL_DEFAULT_SUMMARY
      }
    }
  }],
  DEFAULT_VALIDATE: [{
    title: {
      must_exclude: 'wip|dnm|exp|poc'
    }
  }, {
    label: {
      must_exclude: 'work in progress|do not merge|experimental|proof of concept'
    }
  }, {
    description: {
      no_empty: true
    }
  }, {
    and: [{
      label: {
        regex: 'Label A'
      }}, {
      label: {
        regex: 'Label C'
      }}]
  }],
  DEFAULT_CONFIGURATION: {
    validate: this.DEFAULT_VALIDATE,
    pass: this.DEFAULT_PASS,
    fail: this.DEFAULT_FAIL
  }
}