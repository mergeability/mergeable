const mustExclude = require('../../../validators/options_processor/options/must_exclude')

class MustExclude {
  static process (context, filter, input, rule) {
    return mustExclude.process(filter, input, rule)
  }
}

module.exports = MustExclude
