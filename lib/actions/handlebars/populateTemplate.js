const handlebars = require('handlebars')
handlebars.registerHelper('breaklines', function (text) {
  text = handlebars.Utils.escapeExpression(text)
  text = text.replace(/(\r\n|\n|\r|\n\n)/gm, '<br>')
  return new handlebars.SafeString(text)
})

handlebars.registerHelper('toUpperCase', function(str) {
  return str.toUpperCase();
});

handlebars.registerHelper('displaySettings', function(settings) {
  return `\`\`\`${JSON.stringify(settings)}\`\`\``
});

handlebars.registerHelper('statusIcon', function(str) {
  switch (str) {
    case 'pass':
      return '<img src="https://camo.githubusercontent.com/4d0556db45ed7e727738269645039efabecb09bf/68747470733a2f2f7472617669732d63692e636f6d2f696d616765732f7374726f6b652d69636f6e732f69636f6e2d7061737365642e706e67" height="11" style="max-width:100%;">'
    case 'fail':
      return '<img src="https://camo.githubusercontent.com/c08a3ce7abbfaa9e5b67b53a744696a4ef5e06f0/68747470733a2f2f7472617669732d63692e636f6d2f696d616765732f7374726f6b652d69636f6e732f69636f6e2d6661696c65642e706e67" height="11" style="max-width:100%;">'
    case 'error':
      return ''
    default:
      return `Unknown Status given: ${str}`
  }
});


const populateTemplate = (template, validationResult) => {
  const handlebarsTemplate = handlebars.compile(template)
  return handlebarsTemplate(validationResult)
}

module.exports = populateTemplate
