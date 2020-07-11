const SPECIAL_ANNOTATION = {
  '@author': payload => payload.user.login
}

const searchAndReplaceSpecialAnnotations = (template, payload) => {
  let newTemplate = template

  for (let annotation of Object.keys(SPECIAL_ANNOTATION)) {
    newTemplate = newTemplate.replace(annotation, SPECIAL_ANNOTATION[annotation](payload))
  }
  return newTemplate
}

module.exports = searchAndReplaceSpecialAnnotations
