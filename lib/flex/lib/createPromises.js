const createPromises = (arrayToIterate, registryName, funcCall, context, registry, name, result) => {
  const promises = []
  arrayToIterate.forEach(element => {
    const key = element.do
    const klass = registry[registryName].get(key)
    const eventName = `${context.eventName}.${context.payload.action}`
    if (klass.isEventSupported(eventName)) {
      promises.push(funcCall(klass, context, element, name, result))
    }
  })
  return promises
}

module.exports = createPromises
