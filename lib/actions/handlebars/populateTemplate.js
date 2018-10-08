const handlebars = require('handlebars')

const populateTemplate = (template, validationResult) => {
  const handlebarsTemplate = handlebars.compile(template)
  return handlebarsTemplate(validationResult)
}

module.exports = populateTemplate
