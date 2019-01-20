const handlebars = require('handlebars')
handlebars.registerHelper('breaklines', function (text) {
  text = handlebars.Utils.escapeExpression(text)
  text = text.replace(/(\r\n|\n|\r|\n\n)/gm, '<br>')
  return new handlebars.SafeString(text)
})

handlebars.registerHelper('toUpperCase', function (str) {
  return str.toUpperCase()
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
    default:
      return `Unknown Status given: ${str}`
  }
})

const populateTemplate = (template, validationResult) => {
  const handlebarsTemplate = handlebars.compile(template)
  return handlebarsTemplate(validationResult)
}

module.exports = populateTemplate
