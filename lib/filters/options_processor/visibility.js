const EventAware = require('../../eventAware')

class Visibility {
  static process (context, filter, settings) {
    let payload = (new EventAware()).getPayload(context)
    let status = 'pass'
    if (settings.visibility == 'public' && payload.base.repo.private) {
      status = 'fail'
    }
    if (settings.visibility == 'private' && !payload.base.repo.private) {
      status = 'fail'
    }
    return {
      input: { private: payload.base.repo.private },
      result: { status: status }
    }
  }
}

module.exports = Visibility
