const { Action } = require('./action')
const populateTemplate = require('./handlebars/populateTemplate')

const createComments = async (context, number, body) => {
  return context.github.issues.createComment(
    context.repo({ number, body })
  )
}

class Comments extends Action {
  constructor () {
    super()
    this.supportedEvents = [
      'pull_request.opened',
      'pull_request.edited',
      'issues.opened'
    ]
  }

  // there is nothing to do
  async beforeValidate () {
  }

  populatePayloadWithResult (settings, results) {
    return populateTemplate(settings.payload.body, results)
  }

  async afterValidate (context, settings, results) {
    const payload = this.populatePayloadWithResult(settings, results)

    await createComments(
      context,
      this.getPayload(context).number,
      payload)
  }
}

module.exports = Comments
