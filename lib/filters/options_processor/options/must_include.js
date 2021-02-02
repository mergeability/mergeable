const mustInclude = require('../../../validators/options_processor/options/must_include')

class MustInclude {
  static process (context, filter, input, rule) {
    return mustInclude.process(filter, input, rule)
  }
}

module.exports = MustInclude
