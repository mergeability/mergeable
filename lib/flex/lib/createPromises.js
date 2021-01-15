const createPromises = (arrayToIterate, registryName, funcCall, context, registry, name, result) => {
  let promises = []
  arrayToIterate.forEach(element => {
    let key = element.do
    let klass = registry[registryName].get(key)
    let eventName = `${context.eventName}.${context.payload.action}`
    if (klass.isEventSupported(eventName)) {
      promises.push(funcCall(klass, context, element, name, result))
    }
  })
  return promises
}

module.exports = createPromises
