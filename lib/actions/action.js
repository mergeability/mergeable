class Action {
  /**
   * @param eventName
   *  An event name to be evaluated for support. The name is as in the GitHub
   *  webhook format of issues.opened, pull_request.opened, etc
   *
   * @return boolean true if the validator supports the event. i.e. issues.opened
   */
  isEventSupported (eventName) {
    return isEventInContext(eventName, this.supportedEvents)
  }

  getPayload (context) {
    return context.payload[context.event]
  }
}

const isEventInContext = (eventName, events) => {
  let eventObject = eventName.split('.')[0]
  return ((events.indexOf(eventName.trim()) > -1) ||
    (events.indexOf('pull_request.*') > -1 && eventObject === 'pull_request') ||
    (events.indexOf('issues.*') > -1 && eventObject === 'issues'))
}

module.exports = {
  Action: Action,
  isEventInContext: isEventInContext
}
