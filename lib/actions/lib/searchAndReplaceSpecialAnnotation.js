const SPECIAL_ANNOTATION = {
  '@author': payload => payload.user.login
}

const searchAndReplaceSpecialAnnotations = (template, payload) => {
  let newTemplate = template

  for (const annotation of Object.keys(SPECIAL_ANNOTATION)) {
    const specialAnnotationRegex = new RegExp(`(?<!\\\\)${annotation}`)
    const annotationAtStartRegex = new RegExp(`^${annotation}`)
    const escapeAnnotationRegex = new RegExp(`(\\\\){1}${annotation}`)

    newTemplate = newTemplate.replace(specialAnnotationRegex, `${SPECIAL_ANNOTATION[annotation](payload)}`)
    newTemplate = newTemplate.replace(escapeAnnotationRegex, annotation)
    newTemplate = newTemplate.replace(annotationAtStartRegex, SPECIAL_ANNOTATION[annotation](payload))
  }
  return newTemplate
}

module.exports = searchAndReplaceSpecialAnnotations
