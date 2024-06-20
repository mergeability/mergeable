const handlebars = require('handlebars')
const searchAndReplaceSpecialAnnotations = require('../lib/searchAndReplaceSpecialAnnotation')
const _ = require('lodash')

handlebars.registerHelper('breaklines', function (text) {
  text = handlebars.Utils.escapeExpression(text)
  text = text.replace(/(\r\n|\n|\r|\n\n)/gm, '<br>')
  return new handlebars.SafeString(text)
})

handlebars.registerHelper('toUpperCase', function (str) {
  return str.toUpperCase()
})

handlebars.registerHelper('formatDate', function (str) {
  let date = new Date()
  if (str === undefined) {
    return str
  }
  if (typeof str === 'string') {
    try {
      date = new Date(str)
    } catch {
      return str
    }
  }
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
})

handlebars.registerHelper('displaySettings', function (settings) {
  return `\`\`\`${JSON.stringify(settings)}\`\`\``
})

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('statusIcon', function (str) {
  switch (str) {
    case 'pass':
      return ':heavy_check_mark:'
    case 'fail':
      return ':x:'
    case 'error':
      return ':heavy_exclamation_mark:'
    case 'info':
      return ':information_source:'
    default:
      return `Unknown Status given: ${str}`
  }
})

const populateTemplate = (template, validationResult, payload, event) => {
  const newTemplate = searchAndReplaceSpecialAnnotations(template, payload, event)
  const handlebarsTemplate = handlebars.compile(newTemplate)
  return handlebarsTemplate(_.merge({}, payload, validationResult))
}

module.exports = populateTemplate
