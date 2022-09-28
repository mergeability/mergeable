class EventAware {
  /**
   * @param eventName
   *  An event name to be evaluated for support. The name is as in the GitHub
   *  webhook format of issues.opened, pull_request.opened, etc
   *
   * @return boolean true if the EventAware object supports the event. i.e. issues.opened
   */
  isEventSupported (eventName) {
    const eventObject = eventName.split('.')[0]
    const relevantEvent = this.supportedEvents.filter(event => event.split('.')[0] === eventObject || event === '*')
    return relevantEvent.indexOf('*') > -1 ||
      relevantEvent.indexOf(`${eventObject}.*`) > -1 ||
      relevantEvent.indexOf(eventName) > -1
  }

  getPayload (context, allPayload) {
    if (allPayload) {
      return context.payload
    }

    if (context.eventName === 'issues' || context.eventName === 'issue_comment') {
      return context.payload.issue
    } else if (context.eventName === 'pull_request_review') {
      return context.payload.pull_request
    } else {
      return context.payload[context.eventName]
    }
  }
}

module.exports = EventAware
