const SPECIAL_ANNOTATION = {
  '@author': (payload, event) => payload.user.login,
  '@action': (payload, event) => event.action,
  '@bot': (payload, event) => process.env.APP_NAME ? `${process.env.APP_NAME}[bot]` : 'Mergeable[bot]',
  '@repository': (payload, event) => event.repository?.full_name ?? '',
  '@sender': (payload, event) => event.sender.login ?? ''
}

const searchAndReplaceSpecialAnnotations = (template, payload, event) => {
  let newTemplate = template

  for (const annotation of Object.keys(SPECIAL_ANNOTATION)) {
    const specialAnnotationRegex = new RegExp(`(?<!\\\\)${annotation}`)
    const annotationAtStartRegex = new RegExp(`^${annotation}`)
    const escapeAnnotationRegex = new RegExp(`(\\\\){1}${annotation}`)

    newTemplate = newTemplate.replace(specialAnnotationRegex, `${SPECIAL_ANNOTATION[annotation](payload, event)}`)
    newTemplate = newTemplate.replace(escapeAnnotationRegex, annotation)
    newTemplate = newTemplate.replace(annotationAtStartRegex, SPECIAL_ANNOTATION[annotation](payload, event))
  }
  return newTemplate
}

module.exports = searchAndReplaceSpecialAnnotations
