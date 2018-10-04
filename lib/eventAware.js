class EventAware {
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
    (events.indexOf(`${eventObject}.*`) > -1))
}

module.exports = {
  EventAware,
  isEventInContext: isEventInContext
}
