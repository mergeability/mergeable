class EventAware {
  /**
   * @param eventName
   *  An event name to be evaluated for support. The name is as in the GitHub
   *  webhook format of issues.opened, pull_request.opened, etc
   *
   * @return boolean true if the EventAware object supports the event. i.e. issues.opened
   */
  isEventSupported (eventName) {
    let eventObject = eventName.split('.')[0]
    let relevantEvent = this.supportedEvents.filter(event => event.split('.')[0] === eventObject || event === '*')
    return relevantEvent.indexOf('*') > -1 ||
      relevantEvent.indexOf(`${eventObject}.*`) > -1 ||
      relevantEvent.indexOf(eventName) > -1
  }

  getPayload (context) {
    if (context.event === 'issues') { // event name is 'issues' but payload contain 'issue'
      return context.payload['issue']
    } else if (context.event === 'pull_request_review') {
      return context.payload['pull_request']
    } else {
      return context.payload[context.event]
    }
  }
}

module.exports = EventAware
